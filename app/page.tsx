"use client"

import { useState } from "react"
import { FolderOpen, FileText, ChevronRight, File, Folder, Eye } from "lucide-react"

// 导入你的新布局组件和类型
import { DocumentReportLayout } from "@/components/document-report/document-report-layout"
import { DocumentNode, ReportNode, UploadedFile } from "@/components/document-report/types"

// 导入你的新组件（资料库视图需要）
import { DocumentTree } from "@/components/document-report/document-tree"
import { FlowchartLink } from "@/components/flowchart-link"

// 导入你的操作函数（资料库视图需要）
import { getNode, getNodePath } from "@/components/document-report/tree-operations"
import { formatFileSize } from "@/components/document-report/report-operations"

// -----------------------------------------------------------------
// 1. 从你之前的文件中恢复初始数据
// -----------------------------------------------------------------
const INITIAL_TREE_NODES: DocumentNode[] = [
  {
    id: "1",
    name: "技术文档",
    type: "folder",
    parentId: null,
    children: ["3", "4", "6"],
  },
  {
    id: "2",
    name: "市场分析",
    type: "folder",
    parentId: null,
    children: ["5"],
  },
  {
    id: "3",
    name: "产品技术规格.pdf",
    type: "file",
    parentId: "1",
    uploadDate: "2025-10-20",
    description: "产品技术详细说明",
    content: "# 产品技术规格文档...",
    fileSize: 2048,
  },
  {
    id: "4",
    name: "API接口文档.docx",
    type: "file",
    parentId: "1",
    uploadDate: "2025-10-21",
    description: "RESTful API接口说明",
    content: "# API接口文档...",
    fileSize: 3072,
  },
  {
    id: "5",
    name: "市场调研报告.docx",
    type: "file",
    parentId: "2",
    uploadDate: "2025-10-22",
    description: "2025年市场趋势分析",
    content: "# 2025年市场调研报告...",
    fileSize: 4096,
  },
  {
    id: "6",
    name: "开发规范",
    type: "folder",
    parentId: "1",
    children: ["7", "8"],
  },
  {
    id: "7",
    name: "代码规范.md",
    type: "file",
    parentId: "6",
    uploadDate: "2025-10-18",
    description: "团队代码编写规范",
    content: "# 代码规范...",
    fileSize: 1024,
  },
  {
    id: "8",
    name: "Git提交规范.md",
    type: "file",
    parentId: "6",
    uploadDate: "2025-10-19",
    description: "Git commit message规范",
    content: "# Git提交规范...",
    fileSize: 1536,
  },
]

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
  const [treeNodes, setTreeNodes] = useState<DocumentNode[]>(INITIAL_TREE_NODES)
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

  // -----------------------------------------------------------------
  // 3. 恢复资料库视图需要的辅助函数
  // -----------------------------------------------------------------
  const getNodeFromTree = (id: string) => getNode(treeNodes, id)
  const getPathForNode = (nodeId: string) => getNodePath(treeNodes, nodeId)

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
              />
            </div>

            <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto">
              {/* --- 资料库的预览面板 (从你原版 page.tsx 恢复) --- */}
              {selectedNode ? (
                (() => {
                  const node = getNodeFromTree(selectedNode)
                  if (!node) return null
                  return (
                    <div>
                      {/* ... (此处省略原版 page.tsx 中的详细预览 JSX, 你可以从旧代码复制回来) ... */}
                      <h2 className="text-2xl font-bold mb-2 break-words">{node.name}</h2>
                      <div className="text-sm text-gray-500">
                        路径: {getPathForNode(selectedNode)}
                      </div>
                      {node.type === "file" && node.content && (
                         <div className="mt-6">
                           <h3 className="font-semibold mb-2 flex items-center gap-2">
                             <Eye size={18} />
                             内容预览
                           </h3>
                           <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-[500px] overflow-y-auto">
                             <pre className="whitespace-pre-wrap break-words">{node.content}</pre>
                           </div>
                         </div>
                       )}
                      {/* ... (等等) ... */}
                    </div>
                  )
                })()
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
          />
        )}
      </div>

      {/* 你的 FlowchartLink (如果还需要的话) */}
      <FlowchartLink />
    </div>
  )
}