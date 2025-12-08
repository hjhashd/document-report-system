"use client"

import { useEffect, useState } from "react"
import { DocumentNode } from "./types"
import { use } from "react"

// 动态导入库以避免服务器端渲染问题
const mammoth = typeof window !== "undefined" ? require("mammoth") : null
const xlsx = typeof window !== "undefined" ? require("xlsx") : null

interface DocumentPreviewProps {
  node: DocumentNode | null
  getNodePath?: (nodeId: string) => string
}

export function DocumentPreview({ node, getNodePath }: DocumentPreviewProps) {
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    // 清理函数：释放之前创建的Blob URL
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
      }
    }
  }, [blobUrl])

  // 2. 这是新的主逻辑 Effect
  useEffect(() => {
    if (!node || node.type !== "file") {
      setPreviewContent(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    // 封装一个函数来处理文件内容 (ArrayBuffer 或 string)
    const processContent = (content: string | ArrayBuffer, fileType: string) => {
      if (!mammoth || !xlsx) {
         setError("预览库尚未加载完成，请稍候...");
         setIsLoading(false);
         return;
      }

      let contentProcessed = false;

      try {
        // --- 这是你原有的预览逻辑 ---
        if (typeof content === "string" && (!fileType || fileType.startsWith("text/"))) {
          setPreviewContent(`<pre>${content}</pre>`)
          contentProcessed = true;
        }
        // PDF 预览
        else if (fileType && fileType.includes("pdf")) {
          let blob: Blob
          if (typeof content === "string") {
            // 如果是 base64 编码的字符串
            const binaryString = atob(content)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            blob = new Blob([bytes], { type: "application/pdf" })
          } else {
            // 如果是 ArrayBuffer
            blob = new Blob([content as ArrayBuffer], { type: "application/pdf" })
          }
          const url = URL.createObjectURL(blob)
          setBlobUrl(url)
          setPreviewContent(`<iframe src="${url}" width="100%" height="600px" style="border: none;"></iframe>`)
          contentProcessed = true;
        }
        // Excel 预览
        else if (fileType && (fileType.includes("excel") || fileType.includes("sheet") || fileType.includes("spreadsheet") || fileType.includes("msexcel") || fileType.includes("openxmlformats-officedocument.spreadsheetml"))) {
          const { read, utils } = xlsx
          let workbook
          try {
            workbook = read(content as ArrayBuffer, { type: "array" })
          } catch (e1) {
            console.log("Failed with array, trying buffer:", e1)
            try {
              workbook = read(content as ArrayBuffer, { type: "buffer" })
            } catch (e2) {
              console.log("Failed with buffer, trying binary:", e2)
              workbook = read(content as ArrayBuffer, { type: "binary" })
            }
          }
          
          if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("无法读取Excel文件内容")
          }
          
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const html = utils.sheet_to_html(worksheet)
          setPreviewContent(html)
          contentProcessed = true;
        }
        // Word (.docx) 预览
        else if (fileType && (fileType.includes("officedocument.wordprocessingml") || fileType.includes("msword") || fileType.includes("wordprocessingml"))) {
          mammoth.convertToHtml({ arrayBuffer: content as ArrayBuffer })
            .then(result => {
              setPreviewContent(result.value) // result.value 是 HTML 字符串
            })
            .catch(err => {
              console.error("Mammoth error:", err)
              setError(`无法预览此 Word 文档: ${err instanceof Error ? err.message : String(err)}`)
            })
            .finally(() => {
              setIsLoading(false); // Mammoth 是异步的，需要在这里设置
            });
        }
        // 默认处理
        else {
          console.log("Unsupported file type:", fileType)
          setPreviewContent(`
            <div class="p-4 text-center">
              <p class="text-lg font-semibold">文件: ${node.name}</p>
              <p class="text-sm text-gray-500 mt-2">文件类型: ${fileType || '未知'}</p>
              <p class="text-red-500 mt-4">暂不支持预览此文件类型</p>
            </div>
          `)
          contentProcessed = true;
        }
        // --- 预览逻辑结束 ---
      } catch (err: any) {
        console.error("处理内容时出错:", err);
        setError(`预览文件时出错: ${err.message}`);
        contentProcessed = true;
      } finally {
        // 只有在不是 Word 文档（异步）时才在这里设置 loading
        if (contentProcessed && !fileType.includes("officedocument.wordprocessingml")) {
          setIsLoading(false);
        }
      }
    };

    // --- 这是新的核心逻辑 ---
    // 1. 优先：如果 content 已经存在 (比如来自流程A的用户上传)，直接用
    if (node.content) {
      console.log("正在使用已有的 content 预览...");
      processContent(node.content, node.fileType || "");
    }
    // 2. 其次：如果 content 不存在，但 url 存在 (来自流程B的资料库)，去 fetch
    else if (node.url) {
      console.log(`正在从 ${node.url} 获取文件...`);
      fetch(node.url)
        .then(res => {
          if (!res.ok) throw new Error(`文件加载失败 (status: ${res.status})`);
          // 我们总是获取 ArrayBuffer，因为 mammoth 和 xlsx 都用它
          return res.arrayBuffer();
        })
        .then(arrayBuffer => {
          // 现在我们拿到了文件内容，就像用户刚上传一样
          processContent(arrayBuffer, node.fileType || "");
        })
        .catch(err => {
          console.error("Fetch-preview error:", err);
          setError(`无法从服务器加载文件: ${err.message}`);
          setIsLoading(false);
        });
    }
    // 3. 兜底
    else {
      setError("文件节点无效 (没有 content 也没有 url)");
      setIsLoading(false);
    }

  }, [node]); // 依赖 node 变化

  if (isLoading) {
    return <div className="p-4 text-gray-500">正在加载预览...</div>
  }
  
  if (error) {
     return <div className="p-4 text-red-500">{error}</div>
  }

  if (previewContent) {
    // 使用 dangerouslySetInnerHTML 来渲染所有类型的预览内容
    return (
      <div>
        {node && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2 break-words">{node.name}</h2>
            {getNodePath && (
              <div className="text-sm text-gray-500">
                路径: {getNodePath(node.id)}
              </div>
            )}
          </div>
        )}
        <div 
          className="prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto" 
          dangerouslySetInnerHTML={{ __html: previewContent }} 
        />
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p>请从左侧选择一个文件进行预览</p>
      </div>
    </div>
  )
}