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

  useEffect(() => {
    if (!node || !node.content || node.type !== "file") {
      setPreviewContent(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    const { content, fileType } = node

    // 1. 纯文本预览
    if (typeof content === "string" && (!fileType || fileType.startsWith("text/"))) {
      setPreviewContent(`<pre>${content}</pre>`)
      setIsLoading(false)
    }
    // 2. PDF 预览 - 使用 iframe 方案
    else if (fileType && fileType.includes("pdf")) {
      if (!content) {
        setError("无法预览此 PDF 文件：内容为空。")
        setIsLoading(false)
        return
      }

      try {
        // 创建 Blob URL 并使用 iframe 预览
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
        setIsLoading(false)
      } catch (err) {
        console.error("PDF preview error:", err)
        setError("无法预览此 PDF 文件。")
        setIsLoading(false)
      }
    }
    // 3. Excel (.xlsx, .xls) 预览 - 必须在 Word 之前检查
    else if (fileType && (fileType.includes("excel") || fileType.includes("sheet") || 
             fileType.includes("spreadsheet") || fileType.includes("msexcel") || 
             fileType.includes("openxmlformats-officedocument.spreadsheetml"))) {
      if (!xlsx) {
        setError("Excel 文档预览功能不可用。")
        setIsLoading(false)
        return
      }
      
      try {
        console.log("Processing Excel file with type:", fileType)
        console.log("Content type:", typeof content)
        
        const { read, utils } = xlsx
        
        // 尝试多种读取方式
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
        const html = utils.sheet_to_html(worksheet) // 转换为 HTML 表格
        setPreviewContent(html)
        setIsLoading(false)
      } catch (err) {
        console.error("SheetJS error:", err)
        setError(`无法预览此 Excel 文档: ${err instanceof Error ? err.message : String(err)}`)
        setIsLoading(false)
      }
    }
    // 4. Word (.docx) 预览 - 使用更精确的匹配
    else if (fileType && (fileType.includes("officedocument.wordprocessingml") || 
             fileType.includes("msword") || fileType.includes("wordprocessingml"))) {
      if (!mammoth) {
        setError("Word 文档预览功能不可用。")
        setIsLoading(false)
        return
      }
      
      mammoth.convertToHtml({ arrayBuffer: content as ArrayBuffer })
        .then(result => {
          setPreviewContent(result.value) // result.value 是 HTML 字符串
          setIsLoading(false)
        })
        .catch(err => {
          console.error("Mammoth error:", err)
          setError(`无法预览此 Word 文档: ${err instanceof Error ? err.message : String(err)}`)
          setIsLoading(false)
        })
    }
    
    // 5. 默认处理 - 未识别的文件类型
    else {
      console.log("Unsupported file type:", fileType)
      setPreviewContent(`
        <div class="p-4 text-center">
          <p class="text-lg font-semibold">文件: ${node.name}</p>
          <p class="text-sm text-gray-500 mt-2">文件类型: ${fileType || '未知'}</p>
          <p class="text-sm text-gray-500 mt-2">内容类型: ${typeof content}</p>
          <p class="text-red-500 mt-4">暂不支持预览此文件类型</p>
        </div>
      `)
      setIsLoading(false)
    }

  }, [node])

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