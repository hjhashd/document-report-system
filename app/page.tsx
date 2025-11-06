"use client"

import { useState, useEffect } from "react"
import { FolderOpen, FileText, ChevronRight, File, Folder, Eye } from "lucide-react"

// 导入你的新布局组件和类型
import { DocumentReportLayout } from "@/components/document-report/document-report-layout"
import { DocumentNode, ReportNode, UploadedFile } from "@/components/document-report/types"

// 导入你的新组件（资料库视图需要）
import { DocumentTree } from "@/components/document-report/document-tree"
import { FlowchartLink } from "@/components/flowchart-link"
import { DocumentPreview } from "@/components/document-report/document-preview"

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
  // 2. 恢复 activeTab 状态
  // -----------------------------------------------------------------
  const [activeTab, setActiveTab] = useState("report") // 默认为 "report"

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

  // --- ↓↓↓ 添加此 useEffect ↓↓↓ ---
  useEffect(() => {
    // 当用户点击 "资料库" 标签页时，且数据尚未加载时
    if (activeTab === "library" && treeNodes.length === 0) {
      console.log("正在获取资料库结构...");
      fetch('/api/library') // <--- 请求你在任务1创建的 API
        .then(res => res.json())
        .then((data: DocumentNode[]) => {
          setTreeNodes(data);

          // 自动展开所有第一层级的文件夹
          const rootFolders = data.filter(n => n.type === 'folder' && !n.parentId).map(n => n.id);
          setExpandedNodes(new Set(rootFolders));
        })
        .catch(err => console.error("获取资料库失败:", err));
    }
  }, [activeTab, treeNodes.length, setExpandedNodes]); // 依赖 activeTab
  // --- ↑↑↑ 添加结束 ↑↑↑ ---

  // -----------------------------------------------------------------
  // 3. 恢复资料库视图需要的辅助函数
  // -----------------------------------------------------------------
  const getNodeFromTree = (id: string) => getNode(treeNodes, id)
  const getPathForNode = (nodeId: string) => getNodePath(treeNodes, nodeId)

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

  // 通用文件上传API调用函数
  const handleFileApiUpload = async (
    file: File,
    parentId: string | null = null,
    fileType: string = "document"
  ): Promise<{ docId: string; status: string } | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (parentId) {
        formData.append('parentId', parentId);
      }
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
    
    // 异步处理所有文件
    const fileDataPromises = files.map(async (file) => {
      // 1. 读取文件内容（保持预览功能）
      const { content, fileType } = await readFileContent(file)
      
      // 2. 调用API上传文件到后端
      const uploadResult = await handleFileApiUpload(file, parentId, fileType);
      
      // 3. 创建文档节点对象
      return {
        id: uploadResult?.docId || "doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: "file" as const,
        parentId: parentId || selectedNode, // 如果没有指定parentId，则使用当前选中的节点
        uploadDate: new Date().toISOString(),
        content: content, // 将读取到的内容存入对象
        fileSize: file.size,
        fileType: fileType, // 保存文件类型
        status: uploadResult?.status || "LOCAL", // 添加状态字段
      }
    })

    // 等待所有文件都处理完毕
    const fileData = await Promise.all(fileDataPromises)
    
    // 将新文件添加到资料库
    setTreeNodes([...treeNodes, ...fileData])
  }

  // --- 处理报告信息上传（右侧面板的上传按钮）---
  const handleReportInfoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "style" | "bidding"
  ) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    // --- 准备工作 ---
    const libraryParentId = isFolderNode(treeNodes, selectedNode) ? selectedNode : null
    const reportParentId = isReportFolderNode(reportStructure, selectedReportNode) ? selectedReportNode : null
    
    const readFiles: { file: File; content: string | ArrayBuffer; fileType: string; uploadResult?: { docId: string; status: string } }[] = []
    for (const file of files) {
      const { content, fileType } = await readFileContent(file)
      // 调用API上传文件到后端
      const uploadResult = await handleFileApiUpload(file, libraryParentId, fileType);
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

    // --- 执行逻辑 2: 添加到资料库 (中间面板) ---
    const newDocNodes: DocumentNode[] = readFiles.map(({ file, content, fileType, uploadResult }) => ({
      id: uploadResult?.docId || "doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: "file",
      parentId: libraryParentId,
      uploadDate: new Date().toISOString(),
      description: `上传于 ${new Date().toLocaleDateString()}`,
      content: content,
      fileSize: file.size,
      fileType: fileType,
      status: uploadResult?.status || "LOCAL", // 添加状态字段
    }))
    
    let newTreeNodes = [...treeNodes]
    for (const newNode of newDocNodes) {
      newTreeNodes = addDocumentNodeToTree(newTreeNodes, newNode, libraryParentId)
    }
    setTreeNodes(newTreeNodes) // 更新资料库

    if (libraryParentId) {
      setExpandedNodes(new Set([...expandedNodes, libraryParentId]))
    }

    // --- 执行逻辑 3: 添加到报告结构 (左侧面板) ---
    const newDocIds = new Set(newDocNodes.map(node => node.id))
    
    // 现在这个函数可以正确处理 reportParentId 为 null 的情况了
    addDocumentsToReport(
      newDocIds,
      newTreeNodes,
      reportParentId,
      reportStructure,
      setReportStructure,
      setSelectedDocuments
    )

    if (reportParentId) {
      setExpandedReportNodes(new Set([...expandedReportNodes, reportParentId]))
    }
  }

  // --- 处理文档选择上传（中间面板的上传按钮，专门用于报告目录）---
  const handleDocumentSelectionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // --- 准备工作 ---
    // 1. 确定资料库父节点ID (来自 "选择资料" 面板)
    const libraryParentId = isFolderNode(treeNodes, selectedNode) ? selectedNode : null
    
    // 2. 确定报告目录父节点ID (来自 "当前报告目录" 面板)
    const reportParentId = isReportFolderNode(reportStructure, selectedReportNode) ? selectedReportNode : null

    // 3. 异步读取所有文件并上传到后端
    const readFiles: { file: File; content: string | ArrayBuffer; fileType: string; uploadResult?: { docId: string; status: string } }[] = []
    for (const file of files) {
      const { content, fileType } = await readFileContent(file)
      // 调用API上传文件到后端
      const uploadResult = await handleFileApiUpload(file, libraryParentId, fileType);
      readFiles.push({ file, content, fileType, uploadResult })
    }

    // --- 执行逻辑 1: 添加到资料库 (中间面板) ---
    const newDocNodes: DocumentNode[] = readFiles.map(({ file, content, fileType, uploadResult }) => ({
      id: uploadResult?.docId || "doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: "file",
      parentId: libraryParentId,
      uploadDate: new Date().toISOString(),
      description: `上传于 ${new Date().toLocaleDateString()}`,
      content: content,
      fileSize: file.size,
      fileType: fileType,
      status: uploadResult?.status || "LOCAL", // 添加状态字段
    }))
    
    let newTreeNodes = [...treeNodes]
    for (const newNode of newDocNodes) {
      // 使用我们修复过的不可变函数
      newTreeNodes = addDocumentNodeToTree(newTreeNodes, newNode, libraryParentId)
    }
    setTreeNodes(newTreeNodes) // 更新资料库

    if (libraryParentId) {
      setExpandedNodes(new Set([...expandedNodes, libraryParentId]))
    }

    // --- 执行逻辑 2: 添加到报告结构 (左侧面板) ---
    const newDocIds = new Set(newDocNodes.map(node => node.id))
    
    addDocumentsToReport(
      newDocIds,
      newTreeNodes, // 传入更新后的 treeNodes！
      reportParentId, // 传入左下角选中的父节点ID
      reportStructure,
      setReportStructure,
      setSelectedDocuments // 清空选择
    )

    // 展开左下角的目标目录
    if (reportParentId) {
      setExpandedReportNodes(new Set([...expandedReportNodes, reportParentId]))
    }
  }

  // -----------------------------------------------------------------
  // 4. 恢复完整的页面 JSX (Header, Tabs, Container)
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- 这是你丢失的 Header --- */}
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

      {/* --- 这是你丢失的 Container --- */}
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
          />
        )}
      </div>

      {/* 你的 FlowchartLink (如果还需要的话) */}
      <FlowchartLink />
    </div>
  )
}