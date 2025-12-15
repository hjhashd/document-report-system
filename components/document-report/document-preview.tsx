"use client"

import { useEffect, useState, useRef } from "react"
import { DocumentNode } from "./types"
import { TextPreview } from "./text-preview"
import { use } from "react"

// 动态导入库以避免服务器端渲染问题
const mammoth = typeof window !== "undefined" ? require("mammoth") : null
const xlsx = typeof window !== "undefined" ? require("xlsx") : null

interface DocumentPreviewProps {
  node: DocumentNode | null
  getNodePath?: (nodeId: string) => string
  readOnly?: boolean
}

export function DocumentPreview({ node, getNodePath, readOnly = false }: DocumentPreviewProps) {
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [isMarkdownText, setIsMarkdownText] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const [officeRequested, setOfficeRequested] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  useEffect(() => {
    // 清理函数：释放之前创建的Blob URL
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
      }
    }
  }, [blobUrl])

  // 监听来自 OnlyOffice 的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 检查消息来源是否是 OnlyOffice 编辑器
      if (event.data && event.data.event) {
        console.log("[Document Preview] 收到 OnlyOffice 消息:", event.data)
        
        switch (event.data.event) {
          case "onReady":
            console.log("[Document Preview] OnlyOffice 编辑器已就绪")
            setSaveStatus("编辑器已就绪，可以开始编辑")
            break
          case "onDocumentStateChange":
            console.log("[Document Preview] 文档状态已更改:", event.data)
            break
          case "onRequestSaveAs":
            console.log("[Document Preview] 请求另存为:", event.data)
            break
          case "onRequestInsertImage":
            console.log("[Document Preview] 请求插入图片:", event.data)
            break
          case "onRequestMailMergeRecipients":
            console.log("[Document Preview] 请求邮件合并:", event.data)
            break
          case "onRequestCompareFile":
            console.log("[Document Preview] 请求比较文件:", event.data)
            break
          case "onRequestEditRights":
            console.log("[Document Preview] 请求编辑权限:", event.data)
            break
          case "onRequestHistory":
            console.log("[Document Preview] 请求历史:", event.data)
            break
          case "onRequestHistoryData":
            console.log("[Document Preview] 请求历史数据:", event.data)
            break
          case "onRequestHistoryClose":
            console.log("[Document Preview] 请求关闭历史:", event.data)
            break
          case "onRequestRestore":
            console.log("[Document Preview] 请求恢复:", event.data)
            break
          case "onError":
            console.error("[Document Preview] OnlyOffice 错误:", event.data)
            setSaveStatus(`编辑器错误: ${event.data.data}`)
            break
        }
      }
    }

    // 添加事件监听器
    window.addEventListener("message", handleMessage)
    
    // 清理函数：移除事件监听器
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  // 2. 这是新的主逻辑 Effect
  useEffect(() => {
    if (!node || node.type !== "file") {
      setPreviewContent(null)
      setTextContent(null)
      setIsLoading(false)
      setError(null)
      setOfficeRequested(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setOfficeRequested(false)

    const isOfficeDoc = (node.fileType || "").includes("wordprocessingml") || (node.fileType || "").includes("spreadsheetml")
    
    if (isOfficeDoc && node.url) {
      setOfficeRequested(true)
      setIsLoading(false)
      return
    }

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
          setTextContent(content as string)
          setIsMarkdownText((node.name || "").toLowerCase().endsWith(".md"))
          setPreviewContent(null)
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
          // 尝试作为文本处理
          const decoder = new TextDecoder('utf-8');
          try {
            const text = decoder.decode(content as ArrayBuffer);
            const lower = (node.name || "").toLowerCase()
            const isLikelyText = fileType.startsWith("text/") || lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".json") || lower.endsWith(".xml")
            if (isLikelyText) {
              setTextContent(text)
              setIsMarkdownText(lower.endsWith(".md"))
              setPreviewContent(null)
              contentProcessed = true;
            } else {
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
          } catch (e) {
            console.log("Failed to decode as text:", e);
            setPreviewContent(`
              <div class="p-4 text-center">
                <p class="text-lg font-semibold">文件: ${node.name}</p>
                <p class="text-sm text-gray-500 mt-2">文件类型: ${fileType || '未知'}</p>
                <p class="text-red-500 mt-4">暂不支持预览此文件类型</p>
              </div>
            `)
            contentProcessed = true;
          }
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

    // 2. 优先：如果 content 已经存在 (比如来自流程A的用户上传)，直接用
    if (node.content) {
      processContent(node.content, node.fileType || "");
    }
    // 3. 其次：如果 content 不存在，但 url 存在 (来自流程B的资料库)，去 fetch
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
    // 4. 兜底
    else {
      setError("文件节点无效 (没有 content 也没有 url)");
      setIsLoading(false);
    }

  }, [node]); // 依赖 node 变化

  // 3. 专门处理 OnlyOffice 的 Effect
  useEffect(() => {
    // 定义 cleanup 函数引用，用于清理 DocsAPI 实例
    let docEditor: any = null;

    if (!officeRequested || !node) return

    const isOfficeDoc = (node?.fileType || "").includes("wordprocessingml") || (node?.fileType || "").includes("spreadsheetml")

    const scriptUrls: string[] = []
    if (typeof window !== 'undefined') {
      const hn = window.location.hostname
      scriptUrls.push(`http://${hn}:8082/web-apps/apps/api/documents/api.js`)
    }
    scriptUrls.push(`http://127.0.0.1:8082/web-apps/apps/api/documents/api.js`)

    const loadScript = (urls: string[]) => {
      return new Promise<void>((resolve, reject) => {
        if (typeof window !== "undefined" && (window as any).DocsAPI) {
          resolve();
          return;
        }
        const tryNext = (idx: number) => {
          if (idx >= urls.length) {
            reject(new Error("OnlyOffice 脚本加载失败"))
            return
          }
          const s = document.createElement("script")
          s.src = urls[idx]
          s.async = true
          s.onload = () => resolve()
          s.onerror = () => {
            s.remove()
            tryNext(idx + 1)
          }
          document.head.appendChild(s)
        }
        tryNext(0)
      })
    }

    const initOnlyOffice = (container: HTMLElement) => {
      // 检查是否已经有实例在运行，如果有则销毁
      if ((window as any).DocsAPI && (window as any).DocsAPI.DocEditor && (window as any).DocsAPI.DocEditor.instances) {
         const instances = (window as any).DocsAPI.DocEditor.instances;
         // 找到关联这个 element id 的实例并销毁
         // 但 OnlyOffice 实例列表通常是全局的，这里简单粗暴一点，如果 container 里有东西，先清空
         // 更好的方式是调用 docEditor.destroyEditor() 如果保存了引用
      }
      
      // 清空容器以防重复初始化
      container.innerHTML = ''
      
      const fileType = (node.fileType || '').includes('spreadsheetml') ? 'xlsx' : 'docx'
      const documentType = fileType === 'xlsx' ? 'cell' : 'word'
      const docUrl = `${window.location.origin}${node.url || ''}`
      const callbackUrl = `${window.location.origin}/api/onlyoffice-callback`
      
      // 生成一个包含时间戳的 key，以强制 OnlyOffice 识别为新版本
      const rawKey = (node.url || node.id) + '_' + new Date().getTime()
      const documentKey = typeof btoa === 'function' ? btoa(rawKey) : rawKey

      console.log("[Document Preview] OnlyOffice 配置:", {
        fileType,
        documentType,
        docUrl,
        callbackUrl,
        fileName: node.name,
        key: documentKey
      })
      
      const cfg: any = {
        width: '100%',
        height: '800px',
        type: 'desktop',
        documentType,
        document: {
          fileType,
          url: docUrl,
          title: node.name,
          key: documentKey,
          permissions: {
            comment: !readOnly,
            copy: true,
            download: true,
            edit: !readOnly,
            fillForms: !readOnly,
            modifyFilter: !readOnly,
            modifyContentControl: !readOnly,
            review: !readOnly,
            print: true
          }
        },
        editorConfig: {
          callbackUrl,
          mode: 'edit',
          customization: { 
            zoom: 100,
            autosave: true,
            forcesave: true,
            features: {
              spellcheck: {
                mode: false // 禁用拼写检查（去红线）
              }
            }
          },
          events: {
            onRequestSaveAs: function(event: any) {
              console.log("[Document Preview] OnlyOffice 请求另存为事件:", event)
            },
            onRequestInsertImage: function(event: any) {
              console.log("[Document Preview] OnlyOffice 请求插入图片事件:", event)
            },
            onRequestError: function(event: any) {
              console.error("[Document Preview] OnlyOffice 错误事件:", event)
              setSaveStatus(`保存错误: ${event.data}`)
            }
          }
        }
      }
      
      console.log("[Document Preview] 初始化 OnlyOffice 编辑器...")
      // @ts-ignore
      docEditor = new (window as any).DocsAPI.DocEditor('office-editor-container', cfg)
      setIsLoading(false)
      setSaveStatus("编辑器已加载，您可以开始编辑文档")
    }

    loadScript(scriptUrls)
      .then(() => {
        console.log("[Document Preview] OnlyOffice API 脚本加载成功")
        // 给一点时间让 DOM 渲染完成
        setTimeout(() => {
          // 优先使用 ref，如果不行再用 getElementById
          const container = editorContainerRef.current || document.getElementById('office-editor-container')
          if (!container || !(window as any).DocsAPI) {
            if (isOfficeDoc) {
              console.error("[Document Preview] OnlyOffice 未就绪: 容器或 DocsAPI 不可用")
            }
            // 如果第一次失败，再试一次
            setTimeout(() => {
              const containerRetry = editorContainerRef.current || document.getElementById('office-editor-container')
              if (containerRetry && (window as any).DocsAPI) {
                 initOnlyOffice(containerRetry)
              } else {
                 // 只有在真的找不到的时候才报错，避免切换时的短暂状态
                 if (officeRequested && isOfficeDoc) {
                   setError("OnlyOffice 初始化失败: 无法找到编辑器容器")
                 }
              }
            }, 500)
            return
          }
          initOnlyOffice(container)
        }, 100)
      })
      .catch((e: any) => {
        console.error("[Document Preview] OnlyOffice 加载失败:", e)
        setError(e?.message || String(e))
        setIsLoading(false)
      })

    // Cleanup function
    return () => {
      if (docEditor && typeof docEditor.destroyEditor === 'function') {
        try {
          console.log("[Document Preview] 销毁 OnlyOffice 实例")
          docEditor.destroyEditor();
        } catch (e) {
          console.error("销毁编辑器失败:", e)
        }
      }
      docEditor = null;
    }

  }, [officeRequested, node])

  if (isLoading) {
    return <div className="p-4 text-gray-500">正在加载预览...</div>
  }
  
  if (error) {
     return <div className="p-4 text-red-500">{error}</div>
  }

  if (textContent && !officeRequested) {
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
        <TextPreview text={textContent} isMarkdown={isMarkdownText} />
      </div>
    )
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
        {officeRequested ? (
          <div className="p-2">
            <div className="mb-2 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                OnlyOffice 编辑器
              </div>
              <button
                onClick={() => {
                  console.log("[Document Preview] 用户请求手动保存")
                  setSaveStatus("正在保存...")
                  // 尝试触发 OnlyOffice 的保存操作
                  try {
                    const editorInstance = (window as any).DocsAPI?.DocEditor?.instances?.[0]
                    if (editorInstance) {
                      editorInstance.downloadAs()
                    } else {
                      setSaveStatus("无法访问编辑器实例，请尝试使用编辑器内的保存功能")
                    }
                  } catch (e) {
                    console.error("[Document Preview] 手动保存失败:", e)
                    setSaveStatus(`手动保存失败: ${e instanceof Error ? e.message : String(e)}`)
                  }
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                手动保存
              </button>
            </div>
            <div id="office-editor-container" ref={editorContainerRef} style={{ width: '100%', height: '800px' }} />
          </div>
        ) : (
          <div
            className="prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        )}
      </div>
    )
  }

  if (officeRequested) {
    return (
      <div>
        {node && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2 break-words">{node.name}</h2>
            {getNodePath && (
              <div className="text-sm text-gray-500">路径: {getNodePath(node.id)}</div>
            )}
            {saveStatus && (
              <div className={`mt-2 p-2 text-sm rounded ${saveStatus.includes('错误') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {saveStatus}
              </div>
            )}
          </div>
        )}
        <div className="p-2">
          <div id="office-editor-container" ref={editorContainerRef} style={{ width: '100%', height: '800px' }} />
        </div>
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
