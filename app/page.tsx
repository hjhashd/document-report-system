"use client"

import { useState, useEffect } from "react"
import { FolderOpen, FileText, ChevronRight, File, Folder, Eye, UploadCloud } from "lucide-react" // 添加了 UploadCloud 图标

// 导入你的新布局组件和类型
import { DocumentReportLayout } from "@/components/document-report/document-report-layout"
import { DocumentNode, ReportNode, UploadedFile } from "@/components/document-report/types"

// 导入你的新组件（资料库视图需要）
import { DocumentTree } from "@/components/document-report/document-tree"
import { FlowchartLink } from "@/components/flowchart-link"
import { DocumentPreview } from "@/components/document-report/document-preview"
import { MyUploadsTree } from "@/components/document-report/my-uploads-tree" // 导入 MyUploadsTree

// 导入你的操作函数（资料库视图需要）
import { getNode, getNodePath, readFileContent, getReportNode, addDocumentsToReport, addDocumentNodeToTree } from "@/components/document-report/tree-operations"
import { formatFileSize } from "@/components/document-report/report-operations"

// -----------------------------------------------------------------
// 1. 从你之前的文件中恢复初始数据
// -----------------------------------------------------------------
const INITIAL_TREE_NODES: DocumentNode[] = []

const INITIAL_REPORT_LIBRARY: ReportNode[] = [
  {
    id: "dir-1",
    name: "第一章 概述",
    type: "folder",
    children: [
      { id: "dir-1-1", name: "1.1 项目背景", type: "folder", children: [] },
      { id: "dir-1-2", name: "1.2 目标与范围", type: "folder", children: [] },
    ],
  },
  {
    id: "dir-2",
    name: "第二章 技术方案",
    type: "folder",
    children: [
      { id: "dir-2-1", name: "2.1 技术架构", type: "folder", children: [] },
      { id: "dir-2-2", name: "2.2 接口设计", type: "folder", children: [] },
    ],
  },
  {
    id: "dir-3",
    name: "第三章 实施计划",
    type: "folder",
    children: [],
  },
]

export default function DocumentReportSystem() {
  // -----------------------------------------------------------------
  // 2. 恢复 activeTab 状态（现在有三个可能的值）
  // -----------------------------------------------------------------
  const [activeTab, setActiveTab] = useState("report") // "report", "library", "uploads"

  // --- 你的所有状态（保持不变） ---
  const [reports, setReports] = useState<any[]>([])
  const [treeNodes, setTreeNodes] = useState<DocumentNode[]>([]) // <-- 默认值改为空数组
  const [reportLibrary, setReportLibrary] = useState<ReportNode[]>(INITIAL_REPORT_LIBRARY)
  const [currentView, setCurrentView] = useState("reportCreation") // 默认进入创建视图
  const [currentReportId, setCurrentReportId] = useState<string | null>(null)
  const [reportName, setReportName] = useState("")
  const [reportStructure, setReportStructure] = useState<ReportNode[]>([])
  const [styleDocFiles, setStyleDocFiles] = useState<UploadedFile[]>([])
  const [biddingFiles, setBiddingFiles] = useState<UploadedFile[]>([])
  const [expandedNodes, setExpandedNodes] = useState(new Set(["1", "2"]))
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [documentSearchQuery, setDocumentSearchQuery] = useState("")
  const [selectedDocuments, setSelectedDocuments] = useState(new Set<string>())
  const [expandedLibraryNodes, setExpandedLibraryNodes] = useState(new Set<string>())
  const [expandedReportNodes, setExpandedReportNodes] = useState(new Set<string>())
  const [selectedReportNode, setSelectedReportNode] = useState<string | null>(null)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingNodeName, setEditingNodeName] = useState("")
  const [draggedNode, setDraggedNode] = useState<ReportNode | null>(null)

  // --- 添加新 State ---
  const [myUploadsNodes, setMyUploadsNodes] = useState<DocumentNode[]>([])

  // --- 添加这个新 State ---
  const [selectedUploadNodeId, setSelectedUploadNodeId] = useState<string | null>(null)

  // --- 添加此 useEffect：首次加载就拉取资料库结构 ---
  useEffect(() => {
    if (treeNodes.length === 0) {
      console.log("正在获取资料库结构...");
      fetch('/api/library')
        .then(res => res.json())
        .then((data: DocumentNode[]) => {
          setTreeNodes(data)
          // 自动展开所有第一层级的文件夹
          const rootFolders = data
            .filter(n => n.type === 'folder' && !n.parentId)
            .map(n => n.id)
          setExpandedNodes(new Set(rootFolders))
        })
        .catch(err => console.error("获取资料库失败:", err))
    }
  }, [treeNodes.length])

  // -----------------------------------------------------------------
  // 3. 辅助函数 (为新页面准备)
  // -----------------------------------------------------------------
  const getNodeFromTree = (id: string) => getNode(treeNodes, id)
  const getPathForNode = (nodeId: string) => getNodePath(treeNodes, nodeId)

  // --- 为新页面添加这两个辅助函数 ---
  // 用于 "我的上传" 标签页
  const nodeFromUploads = getNode(myUploadsNodes, selectedUploadNodeId)
  const getPathForUploadNode = (nodeId: string) => {
    const node = getNode(myUploadsNodes, nodeId)
    return "我的上传 / " + (node ? node.name : "")
  }

  // 辅助函数：检查节点是否为文件夹
  const isFolderNode = (nodes: DocumentNode[], nodeId: string | null): boolean => {
    if (!nodeId) return false
    const node = getNode(nodes, nodeId)
    return node?.type === "folder"
  }

  // 辅助函数：检查报告节点是否为文件夹
  const isReportFolderNode = (nodes: ReportNode[], nodeId: string | null): boolean => {
    if (!nodeId) return false
    const node = getReportNode(nodes, nodeId)
    return node?.type === "folder"
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const toggleDocumentSelection = (docId: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(docId)) {
      newSelected.delete(docId)
    } else {
      newSelected.add(docId)
    }
    setSelectedDocuments(newSelected)
  }

  const handleUpdateDocumentNodeName = (nodeId: string, newName: string) => {
    if (!newName.trim()) return
    setTreeNodes(
      treeNodes.map((node) =>
        node.id === nodeId ? { ...node, name: newName.trim() } : node
      )
    )
  }

  // 为 "我的上传" 添加重命名和删除 Handler
  const handleUpdateMyUploadsNodeName = (nodeId: string, newName: string) => {
    if (!newName.trim()) return
    setMyUploadsNodes(
      myUploadsNodes.map((node) =>
        node.id === nodeId ? { ...node, name: newName.trim() } : node
      )
    )
  }

  const handleDeleteMyUploadsNode = (nodeId: string) => {
    setMyUploadsNodes(
      myUploadsNodes.filter((node) => node.id !== nodeId)
    )
  }

  // 通用文件上传API调用函数
  const handleFileApiUpload = async (
    file: File,
    parentId: string | null = null,
    fileType: string = "document"
  ): Promise<{ docId: string; status: string } | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parentId', parentId);
      formData.append('fileType', fileType);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();
      return {
        docId: result.docId,
        status: result.status
      };
    } catch (error) {
      console.error('上传文件时出错:', error);
      return null;
    }
  };

  // --- 新增资料库文件上传函数 ---
  const handleLibraryFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    parentId: string | null = null
  ) => {
    const files = Array.from(e.target.files || [])
    
    // --- 准备工作 ---
    // "我的上传" 目录总是根目录
    const myUploadsParentId = null
    
    // 异步处理所有文件
    const fileDataPromises = files.map(async (file) => {
      // 1. 读取文件内容（保持预览功能）
      const { content, fileType } = await readFileContent(file)
      
      // 2. 调用API上传文件到后端
      const uploadResult = await handleFileApiUpload(file, myUploadsParentId, fileType);
      
      // 3. 创建文档节点对象
      return {
        id: uploadResult?.docId || "doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: "file" as const,
        parentId: myUploadsParentId, // <-- 确保为 null
        uploadDate: new Date().toISOString(),
        content: content, // 将读取到的内容存入对象
        fileSize: file.size,
        fileType: fileType, // 保存文件类型
        status: uploadResult?.status || "LOCAL", // 添加状态字段
      }
    })

    // 等待所有文件都处理完毕
    const fileData = await Promise.all(fileDataPromises)
    
    // 将新文件添加到 "我的上传" state
    setMyUploadsNodes(prevNodes => [...prevNodes, ...fileData])
  }

  // --- 处理报告信息上传（右侧面板的上传按钮）---
  const handleReportInfoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "style" | "bidding"
  ) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    // --- 准备工作 ---
    // "我的上传" 目录总是根目录
    const myUploadsParentId = null
    
    const readFiles: { file: File; content: string | ArrayBuffer; fileType: string; uploadResult?: { docId: string; status: string } }[] = []
    for (const file of files) {
      const { content, fileType } = await readFileContent(file)
      // 调用API上传文件到后端
      const uploadResult = await handleFileApiUpload(file, myUploadsParentId, fileType);
      readFiles.push({ file, content, fileType, uploadResult })
    }

    // --- 执行逻辑 1: 更新附件 (右侧面板) ---
    const newUploadedFiles: UploadedFile[] = readFiles.map(({ file, content, fileType, uploadResult }) => ({
      id: uploadResult?.docId || "file-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      content: content,
      fileType: fileType,
    }))

    if (fileType === "style") {
      setStyleDocFiles([...styleDocFiles, ...newUploadedFiles])
    } else {
      setBiddingFiles([...biddingFiles, ...newUploadedFiles])
    }

    // --- 执行逻辑: 只添加到 "我的上传" ---
    const newDocNodes: DocumentNode[] = readFiles.map(({ file, content, fileType, uploadResult }) => ({
      id: uploadResult?.docId || "doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: "file",
      parentId: myUploadsParentId, // <-- 确保为 null
      uploadDate: new Date().toISOString(),
      description: `上传于 ${new Date().toLocaleDateString()}`,
      content: content,
      fileSize: file.size,
      fileType: fileType,
      status: uploadResult?.status || "LOCAL",
    }))
    
    // 将新文件添加到 "我的上传" state
    setMyUploadsNodes(prevNodes => [...prevNodes, ...newDocNodes])
  }

  // --- 处理文档选择上传（中间面板的上传按钮，专门用于报告目录）---
  const handleDocumentSelectionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // --- 准备工作 ---
    // 1. "我的上传" 目录总是根目录
    const parentId = null

    // 2. 异步读取所有文件并上传到后端
    const readFiles: { file: File; content: string | ArrayBuffer; fileType: string; uploadResult?: { docId: string; status: string } }[] = []
    for (const file of files) {
      const { content, fileType } = await readFileContent(file)
      const uploadResult = await handleFileApiUpload(file, parentId, fileType);
      readFiles.push({ file, content, fileType, uploadResult })
    }

    // --- 执行逻辑: 只添加到 "我的上传" ---
    const newDocNodes: DocumentNode[] = readFiles.map(({ file, content, fileType, uploadResult }) => ({
      id: uploadResult?.docId || "doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: "file",
      parentId: parentId, // <-- 确保为 null
      uploadDate: new Date().toISOString(),
      description: `上传于 ${new Date().toLocaleDateString()}`,
      content: content,
      fileSize: file.size,
      fileType: fileType,
      status: uploadResult?.status || "LOCAL",
    }))
    
    // 将新文件添加到 "我的上传" state
    setMyUploadsNodes(prevNodes => [...prevNodes, ...newDocNodes])
  }

  // 添加文档到报告的处理函数
  const handleAddDocumentToReport = (
    documentIds: Set<string>,
    sourceNodes: DocumentNode[],
    myUploadsNodes: DocumentNode[], // <-- 添加 myUploadsNodes 参数
    targetParentId: string | null,
    reportStructure: ReportNode[],
    setReportStructure: (structure: ReportNode[]) => void,
    selectedDocuments: Set<string>,
    setSelectedDocuments: (docs: Set<string>) => void
  ) => {
   addDocumentsToReport(
      documentIds,
      sourceNodes,
      myUploadsNodes, // <-- 添加 myUploadsNodes 参数
      targetParentId,
      reportStructure,
      setReportStructure,
      selectedDocuments,
      setSelectedDocuments
    )
  }

  // 从"我的上传"添加单个文档到报告的处理函数
  const handleAddSingleDocumentToReport = (docId: string) => {
    // 创建只包含单个文档ID的Set
    const documentIds = new Set([docId])
    
    // 调用原有的handleAddDocumentToReport函数
    handleAddDocumentToReport(
      documentIds,
      myUploadsNodes,
      myUploadsNodes, // <-- 添加 myUploadsNodes 参数
      selectedReportNode,
      reportStructure,
      setReportStructure,
      selectedDocuments,
      setSelectedDocuments
    )
  }

  // --- ↓↓↓ 修复预览处理函数：根据来源切换正确的标签页 ↓↓↓ ---
  const handlePreviewDocument = (docId: string) => {
    // 如果是“我的上传”里的文档，则切换到“我的上传”标签并设置选中项
    const isFromUploads = myUploadsNodes.some(n => n.id === docId)
    if (isFromUploads) {
      setActiveTab("uploads")
      setSelectedUploadNodeId(docId)
      return
    }

    // 否则默认切到“资料库”并设置资料库的选中项
    setActiveTab("library")
    setSelectedNode(docId)
  }
  // --- ↑↑↑ Handler 修复结束 ↑↑↑ ---

  // -----------------------------------------------------------------
  // 4. 恢复完整的页面 JSX (Header, Tabs, Container)
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- 修改 Header，添加新按钮 --- */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-800">文档报告系统</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("library")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "library" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={20} />
                  资料库
                </div>
              </button>

              {/* --- 这是新按钮 --- */}
              <button
                onClick={() => setActiveTab("uploads")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "uploads" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UploadCloud size={20} />
                  我的上传
                </div>
              </button>
              {/* --- 新按钮结束 --- */}

              <button
                onClick={() => setActiveTab("report")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "report" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={20} />
                  报告生成
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 这是你丢失的 Container --- */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === "library" ? (
          // -----------------------------------------------------------------
          // 5. 恢复资料库视图 (Library View)
          // -----------------------------------------------------------------
          <div className="flex gap-6 h-[calc(100vh-140px)]">
            <div className="w-80 bg-white rounded-lg shadow p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">资料目录</h2>
              </div>
              <DocumentTree
                treeNodes={treeNodes}
                expandedNodes={expandedNodes}
                selectedNode={selectedNode}
                selectedDocuments={selectedDocuments}
                documentSearchQuery={documentSearchQuery}
                onToggleNode={toggleNode}
                onSelectNode={setSelectedNode}
                onToggleDocumentSelection={toggleDocumentSelection}
                onDocumentSearchChange={setDocumentSearchQuery}
                onAddDocumentToReport={() => {}} // 资料库视图不需要这个
                selectedReportNode={null}
                editingNodeId={editingNodeId}
                editingNodeName={editingNodeName}
                onSetEditingNodeId={setEditingNodeId}
                onSetEditingNodeName={setEditingNodeName}
                onUpdateNodeName={handleUpdateDocumentNodeName}
                onFileUpload={handleLibraryFileUpload}
                onAttachmentFileUpload={handleReportInfoUpload}
                viewMode="library"
              />
            </div>

            <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto">
              {/* --- 资料库的预览面板 (从你原版 page.tsx 恢复) --- */}
              {selectedNode ? (
                <DocumentPreview
                  node={getNodeFromTree(selectedNode)}
                  getNodePath={getPathForNode}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FolderOpen size={64} className="mx-auto mb-4 opacity-50" />
                    <p>请从左侧选择一个目录或文件</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "uploads" ? (
          // --- 添加 "我的上传" 视图 ---
          <div className="flex gap-6 h-[calc(100vh-140px)]">
            {/* 左侧：我的上传列表 */}
            <div className="w-80 bg-white rounded-lg shadow p-4 overflow-y-auto flex flex-col">
              <h2 className="text-lg font-semibold mb-4 px-2">我的上传文件</h2>
              <MyUploadsTree
                nodes={myUploadsNodes}
                viewMode="library" // <-- 设置为预览模式
                selectedNodeId={selectedUploadNodeId}
                onSelectNode={setSelectedUploadNodeId}
                
                // (在预览模式下，这些 prop 用来禁用编辑功能)
                onAddDocumentToReport={() => {}}
                editingNodeId={null}
                editingNodeName=""
                onSetEditingNodeId={() => {}}
                onSetEditingNodeName={() => {}}
                onUpdateNodeName={() => {}}
                onDeleteNode={() => {}}
              />
            </div>
            
            {/* 右侧：预览面板 */}
            <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto">
              <DocumentPreview
                node={nodeFromUploads}
                getNodePath={getPathForUploadNode}
              />
            </div>
          </div>
        // --- "我的上传" 视图结束 ---
        ) : (
          // -----------------------------------------------------------------
          // 6. 渲染你的新布局组件 (Report View)
          // -----------------------------------------------------------------
          <DocumentReportLayout
            // 传入所有需要的 props
            reports={reports}
            treeNodes={treeNodes}
            reportLibrary={reportLibrary}
            setReports={setReports}
            setTreeNodes={setTreeNodes}
            setReportLibrary={setReportLibrary}
            currentView={currentView}
            setCurrentView={setCurrentView}
            currentReportId={currentReportId}
            reportName={reportName}
            reportStructure={reportStructure}
            styleDocFiles={styleDocFiles}
            biddingFiles={biddingFiles}
            setCurrentReportId={setCurrentReportId}
            setReportName={setReportName}
            setReportStructure={setReportStructure}
            setStyleDocFiles={setStyleDocFiles}
            setBiddingFiles={setBiddingFiles}
            expandedNodes={expandedNodes}
            selectedNode={selectedNode}
            documentSearchQuery={documentSearchQuery}
            selectedDocuments={selectedDocuments}
            expandedLibraryNodes={expandedLibraryNodes}
            expandedReportNodes={expandedReportNodes}
            selectedReportNode={selectedReportNode}
            editingNodeId={editingNodeId}
            editingNodeName={editingNodeName}
            draggedNode={draggedNode}
            setExpandedNodes={setExpandedNodes}
            setSelectedNode={setSelectedNode}
            setDocumentSearchQuery={setDocumentSearchQuery}
            setSelectedDocuments={setSelectedDocuments}
            setExpandedLibraryNodes={setExpandedLibraryNodes}
            setExpandedReportNodes={setExpandedReportNodes}
            setSelectedReportNode={setSelectedReportNode}
            setEditingNodeId={setEditingNodeId}
            setEditingNodeName={setEditingNodeName}
            setDraggedNode={setDraggedNode}
            onFileUpload={handleLibraryFileUpload}
            onAttachmentFileUpload={handleReportInfoUpload}
            onDocumentSelectionUpload={handleDocumentSelectionUpload} // <--- 新增
            onReportInfoUpload={handleReportInfoUpload} // <--- 新增
            
            // 传入新的 State 和 Handlers
            myUploadsNodes={myUploadsNodes}
            setMyUploadsNodes={setMyUploadsNodes}
            onUpdateMyUploadsNodeName={handleUpdateMyUploadsNodeName}
            onDeleteMyUploadsNode={handleDeleteMyUploadsNode}
            onAddDocumentToReport={handleAddSingleDocumentToReport} // <-- 传入新的函数
            onToggleDocumentSelection={toggleDocumentSelection}
            onPreviewDocument={handlePreviewDocument}
          />
        )}
      </div>

      {/* 你的 FlowchartLink (如果还需要的话) */}
      <FlowchartLink />
    </div>
  )
}