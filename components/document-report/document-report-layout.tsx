"use client"

import React, { useState } from "react" // 导入 React 和 useState
import { Download, ArrowLeft } from "lucide-react" // 导入图标
import { ReportListView } from "./report-list-view"
import { ReportLibrary } from "./report-library"
import { DocumentSelection } from "./document-selection"
import { ReportTree } from "./report-tree"
import { ReportInfo } from "./report-info"
import { NewReportFolderModal } from "./new-report-folder-modal"
import { CreateLibraryDirectoryModal } from "./create-library-directory-modal"
import { ReportNode, DocumentNode, UploadedFile } from "./types"
import {
  createNewReport,
  saveReport,
  editReport,
  deleteReport,
  handleFileUpload,
  removeUploadedFile,
  generateReport,
} from "./report-operations"
import {
  getNode,
  getReportNode,
  getReportFolders,
  getNodePath,
  getReportNodePath,
  filterDocuments,
  deepCopyStructure,
  addDocumentToReport,
  addDocumentsToReport,
  deleteReportNode,
  saveEditedNodeName,
  handleDragDrop,
  readFileContent, // <--- 引入
  addDocumentNodeToTree, // <--- 引入
} from "./tree-operations"

interface DocumentReportLayoutProps {
  // Data
  reports: any[]
  treeNodes: DocumentNode[]
  reportLibrary: ReportNode[]
  
  // State setters
  setReports: (reports: any[]) => void
  setTreeNodes: (nodes: DocumentNode[]) => void
  setReportLibrary: (library: ReportNode[]) => void
  
  // Current view state
  currentView: string
  setCurrentView: (view: string) => void
  
  // Report state
  currentReportId: string | null
  reportName: string
  reportStructure: ReportNode[]
  styleDocFiles: UploadedFile[]
  biddingFiles: UploadedFile[]
  
  // Report state setters
  setCurrentReportId: (id: string | null) => void
  setReportName: (name: string) => void
  setReportStructure: (structure: ReportNode[]) => void
  setStyleDocFiles: (files: UploadedFile[]) => void
  setBiddingFiles: (files: UploadedFile[]) => void
  
  // UI state
  expandedNodes: Set<string>
  selectedNode: string | null
  documentSearchQuery: string
  selectedDocuments: Set<string>
  expandedLibraryNodes: Set<string>
  expandedReportNodes: Set<string>
  selectedReportNode: string | null
  editingNodeId: string | null
  editingNodeName: string
  draggedNode: ReportNode | null
  
  // UI state setters
  setExpandedNodes: (nodes: Set<string>) => void
  setSelectedNode: (nodeId: string | null) => void
  setDocumentSearchQuery: (query: string) => void
  setSelectedDocuments: (documents: Set<string>) => void
  setExpandedLibraryNodes: (nodes: Set<string>) => void
  setExpandedReportNodes: (nodes: Set<string>) => void
  setSelectedReportNode: (nodeId: string | null) => void
  setEditingNodeId: (nodeId: string | null) => void
  setEditingNodeName: (name: string) => void
  setDraggedNode: (node: ReportNode | null) => void
  
  // File upload handler
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAttachmentFileUpload: (e: React.ChangeEvent<HTMLInputElement>, fileType: "style" | "bidding") => void
  onDocumentSelectionUpload: (e: React.ChangeEvent<HTMLInputElement>) => void // <--- 新增
  onReportInfoUpload: (e: React.ChangeEvent<HTMLInputElement>, fileType: "style" | "bidding") => void // <--- 新增
}


export function DocumentReportLayout({
  // ... (所有 props) ...
  reports,
  treeNodes,
  reportLibrary,
  setReports,
  setTreeNodes,
  setReportLibrary,
  currentView,
  setCurrentView,
  currentReportId,
  reportName,
  reportStructure,
  styleDocFiles,
  biddingFiles,
  setCurrentReportId,
  setReportName,
  setReportStructure,
  setStyleDocFiles,
  setBiddingFiles,
  expandedNodes,
  selectedNode,
  documentSearchQuery,
  selectedDocuments,
  expandedLibraryNodes,
  expandedReportNodes,
  selectedReportNode,
  editingNodeId,
  editingNodeName,
  draggedNode,
  setExpandedNodes,
  setSelectedNode,
  setDocumentSearchQuery,
  setSelectedDocuments,
  setExpandedLibraryNodes,
  setExpandedReportNodes,
  setSelectedReportNode,
  setEditingNodeId,
  setEditingNodeName,
  setDraggedNode,
  onFileUpload,
  onAttachmentFileUpload,
  onDocumentSelectionUpload, // <--- 新增
  onReportInfoUpload, // <--- 新增
}: DocumentReportLayoutProps) {
  // Modal states (保持不变)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [parentFolder, setParentFolder] = useState<string | null>(null)
  const [showCreateLibraryModal, setShowCreateLibraryModal] = useState(false)
  const [libraryDirectoryName, setLibraryDirectoryName] = useState("")
  
  // 报告生成状态
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportUrl, setReportUrl] = useState<string | undefined>(undefined)
  
  // -----------------------------------------------------------------
  // 你的所有 handler functions (保持不变)
  // -----------------------------------------------------------------
  
  const handleToggleNode = (nodeId: string) => {
    // ... (你的逻辑) ...
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId)
    else newExpanded.add(nodeId)
    setExpandedNodes(newExpanded)
  }

  const handleToggleLibraryNode = (nodeId: string) => {
    // ... (你的逻辑) ...
    const newExpanded = new Set(expandedLibraryNodes)
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId)
    else newExpanded.add(nodeId)
    setExpandedLibraryNodes(newExpanded)
  }

  const handleToggleReportNode = (nodeId: string) => {
    // ... (你的逻辑) ...
    const newExpanded = new Set(expandedReportNodes)
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId)
    else newExpanded.add(nodeId)
    setExpandedReportNodes(newExpanded)
  }

  const handleToggleDocumentSelection = (docId: string) => {
    // ... (你的逻辑) ...
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(docId)) newSelected.delete(docId)
    else newSelected.add(docId)
    setSelectedDocuments(newSelected)
  }

  const handleAddDocumentToReport = (docId: string) => {
    addDocumentToReport(
      docId,
      treeNodes,
      selectedReportNode,
      reportStructure,
      setReportStructure
    )
  }

  const handleAddDocumentsToReport = () => {
    addDocumentsToReport(
      selectedDocuments,
      treeNodes,
      selectedReportNode,
      reportStructure,
      setReportStructure,
      setSelectedDocuments
    )
  }

  const handleDeleteReportNode = (nodeId: string) => {
    deleteReportNode(
      nodeId,
      reportStructure,
      setReportStructure,
      selectedReportNode,
      setSelectedReportNode
    )
  }

  const handleCreateReportFolder = (parentId: string | null, name: string) => {
    // ... (你的逻辑) ...
    if (!name.trim()) return

    const newFolder: ReportNode = {
      id: "folder-" + Date.now(),
      name: name.trim(),
      type: "folder",
      children: [],
    }

    if (parentId === null) {
      setReportStructure([...reportStructure, newFolder])
    } else {
      const addToParent = (nodes: ReportNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === parentId && node.type === "folder") {
            node.children = node.children || []
            node.children.push(newFolder)
            return true
          }
          if (node.children && addToParent(node.children)) return true
        }
        return false
      }
      const newStructure = [...reportStructure]
      if (addToParent(newStructure)) {
        setReportStructure(newStructure)
        setExpandedReportNodes(new Set([...expandedReportNodes, parentId]))
      }
    }
  }

  const handleSaveEditedNodeName = () => {
    saveEditedNodeName(
      editingNodeId,
      editingNodeName,
      reportStructure,
      setReportStructure,
      setEditingNodeId,
      setEditingNodeName
    )
  }

  const handleRemoveStyleFile = (fileId: string) => {
    removeUploadedFile(fileId, "style", styleDocFiles, biddingFiles, setStyleDocFiles, setBiddingFiles)
  }

  const handleRemoveBiddingFile = (fileId: string) => {
    removeUploadedFile(fileId, "bidding", styleDocFiles, biddingFiles, setStyleDocFiles, setBiddingFiles)
  }

  const handleGenerateReport = () => {
    // 设置生成状态为true
    setIsGenerating(true)
    setReportUrl(undefined)
    
    // 模拟生成报告的过程
    setTimeout(() => {
      // 模拟从本地upload目录获取文件
      // 在实际应用中，这里应该调用后端API获取生成的报告URL
      const mockReportUrl = "/uploads/sample-report.pdf"
      setReportUrl(mockReportUrl)
      setIsGenerating(false)
    }, 5000) // 模拟5秒的生成时间
  }

  const handleRegenerateReport = () => {
    // 重置报告状态，重新开始生成过程
    setReportUrl(undefined)
    setIsGenerating(true)
    
    // 模拟重新生成报告的过程
    setTimeout(() => {
      // 模拟从本地upload目录获取文件
      // 在实际应用中，这里应该调用后端API获取生成的报告URL
      const mockReportUrl = "/uploads/sample-report.pdf"
      setReportUrl(mockReportUrl)
      setIsGenerating(false)
    }, 5000) // 模拟5秒的生成时间
  }

  const handleBackToList = () => {
    setCurrentView("reportList")
  }

  // 计算 reportFolders，并传递给 ReportLibrary
  const reportFolders = getReportFolders(reportStructure)
  
  // (这是你原有的函数，稍作修改以使用 getReportNode)
  const handleApplyDirectory = (nodeId: string, name: string, targetParentId: string | null) => {
    // (注意：这里应该从 reportLibrary 查找, 而非 reportStructure)
    const findInLibrary = (nodes: ReportNode[], id: string): ReportNode | null => {
      for(const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findInLibrary(node.children, id)
          if (found) return found
        }
      }
      return null
    }
    const node = findInLibrary(reportLibrary, nodeId)
    if (!node || node.type !== "folder") return

    const newNode = deepCopyStructure(node)
    newNode.name = name

    if (targetParentId === null) {
      setReportStructure([...reportStructure, newNode])
    } else {
      const addToParent = (nodes: ReportNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === targetParentId && node.type === "folder") {
            node.children = node.children || []
            node.children.push(newNode)
            return true
          }
          if (node.children && addToParent(node.children)) return true
        }
        return false
      }
      const newStructure = [...reportStructure]
      if (addToParent(newStructure)) {
        setReportStructure(newStructure)
        setExpandedReportNodes(new Set([...expandedReportNodes, targetParentId]))
      }
    }
  }

  const handleBatchApplyDirectories = (prefix: string, targetParentId: string | null) => {
    // ... (你的逻辑) ...
    const newNodes = reportLibrary.map((node) => {
      if (node.type !== "folder") return null
      const newNode = deepCopyStructure(node)
      newNode.name = `${prefix}${newNode.name}`
      return newNode
    }).filter(Boolean) as ReportNode[]

    if (targetParentId === null) {
      setReportStructure([...reportStructure, ...newNodes])
    } else {
       const addToParent = (nodes: ReportNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === targetParentId && node.type === "folder") {
            node.children = node.children || []
            node.children.push(...newNodes)
            return true
          }
          if (node.children && addToParent(node.children)) return true
        }
        return false
      }
      const newStructure = [...reportStructure]
      if (addToParent(newStructure)) {
        setReportStructure(newStructure)
        setExpandedReportNodes(new Set([...expandedReportNodes, targetParentId]))
      }
    }
  }

  const handleCreateLibraryDirectory = (name: string) => {
    // ... (你的逻辑) ...
    if (!name.trim()) return
    const newDirectory: ReportNode = {
      id: "lib-" + Date.now(),
      name: name.trim(),
      type: "folder",
      children: [],
    }
    setReportLibrary([...reportLibrary, newDirectory])
  }

  const handleDeleteLibraryDirectory = (nodeId: string) => {
    // ... (你的逻辑) ...
    if (!window.confirm("确定要删除此目录吗？")) return
    
    const removeDir = (nodes: ReportNode[], id: string): ReportNode[] => {
      return nodes.filter(node => {
        if (node.id === id) return false
        if (node.children) {
          node.children = removeDir(node.children, id)
        }
        return true
      })
    }
    setReportLibrary(removeDir([...reportLibrary], nodeId))
  }

  const handleEditLibraryDirectory = (nodeId: string, name: string) => {
    // ... (你的逻辑) ...
    if (!name.trim()) return

    const updateDirectory = (nodes: ReportNode[]): boolean => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          node.name = name.trim()
          return true
        }
        if (node.children && updateDirectory(node.children)) return true
      }
      return false
    }
    const newLibrary = [...reportLibrary]
    if (updateDirectory(newLibrary)) {
      setReportLibrary(newLibrary)
    }
  }
  
  // (这是你之前缺失的，用于资料库的 document tree)
  const handleUpdateDocumentNodeName = (nodeId: string, newName: string) => {
    if (!newName.trim()) return
    setTreeNodes(
      treeNodes.map((node) =>
        node.id === nodeId ? { ...node, name: newName.trim() } : node
      )
    )
  }

  // -----------------------------------------------------------------
  // 5. 修复 JSX 布局 (移除外壳, 恢复12列网格)
  // -----------------------------------------------------------------
  return (
    <>
      {currentView === "reportList" && (
        <ReportListView
          reports={reports}
          onCreateNewReport={() =>
            createNewReport(
              setReportName,
              setReportStructure,
              setSelectedReportNode,
              setStyleDocFiles,
              setBiddingFiles,
              setCurrentReportId,
              setCurrentView
            )
          }
          onEditReport={(reportId) =>
            editReport(
              reportId,
              reports,
              setCurrentReportId,
              setReportName,
              setReportStructure,
              setStyleDocFiles,
              setBiddingFiles,
              setCurrentView
            )
          }
          onDeleteReport={(reportId) =>
            deleteReport(reportId, reports, setReports)
          }
        />
      )}

      {currentView === "reportCreation" && (
        // (注意: 外层 div 已被移除)
        // (这个 div h-[calc(100vh-140px)] 来自你原版的 page.tsx)
        <div className="h-[calc(100vh-140px)]"> 
          {/* --- 这是你丢失的按钮栏 --- */}
          <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentView("reportList")}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                返回列表
              </button>
              <button
                onClick={() => saveReport(reportName, reportStructure, styleDocFiles, biddingFiles, currentReportId, reports, setReports, setCurrentView)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={20} />
                保存报告
              </button>
            </div>

          {/* --- 这是你丢失的 12-列网格布局 --- */}
          {/* (这个 h-[calc(100%-60px)] 来自你原版的 page.tsx) */}
          <div className="grid grid-cols-12 gap-6 h-[calc(100%-60px)]">
            
            {/* --- 第 1 列: 目录库 + 报告目录 (col-span-3) --- */}
            <div className="col-span-3 flex flex-col gap-4">
              {/* (为 ReportLibrary 添加 "box" 样式) */}
              <div className="bg-white rounded-lg shadow p-4 h-[45%] overflow-y-auto">
                <ReportLibrary
                  reportLibrary={reportLibrary}
                  expandedLibraryNodes={expandedLibraryNodes}
                  onToggleLibraryNode={handleToggleLibraryNode}
                  onApplyDirectory={handleApplyDirectory}
                  onBatchApplyDirectories={handleBatchApplyDirectories}
                  onCreateLibraryDirectory={handleCreateLibraryDirectory}
                  onDeleteLibraryDirectory={handleDeleteLibraryDirectory}
                  onEditLibraryDirectory={handleEditLibraryDirectory}
                  getReportNodePath={(nodeId) => getReportNodePath(reportStructure, nodeId)}
                  reportFolders={reportFolders} // <-- 修复 Bug
                />
              </div>
              {/* (为 ReportTree 添加 "box" 样式) */}
              <div className="bg-white rounded-lg shadow p-4 h-[55%] overflow-y-auto">
                <ReportTree
                  reportStructure={reportStructure}
                  expandedReportNodes={expandedReportNodes}
                  selectedReportNode={selectedReportNode}
                  onToggleReportNode={handleToggleReportNode}
                  onSelectReportNode={setSelectedReportNode}
                  onDeleteReportNode={handleDeleteReportNode}
                  onCreateReportFolder={handleCreateReportFolder}
                  editingNodeId={editingNodeId}
                  editingNodeName={editingNodeName}
                  onSetEditingNodeId={setEditingNodeId}
                  onSetEditingNodeName={setEditingNodeName}
                  onSaveEditedNodeName={handleSaveEditedNodeName}
                  draggedNode={draggedNode}
                  onSetDraggedNode={setDraggedNode}
                  getReportNodePath={(nodeId) => getReportNodePath(reportStructure, nodeId)}
                  setReportStructure={setReportStructure} // <-- 修复 Bug
                  setExpandedReportNodes={setExpandedReportNodes} // <-- 修复 Bug
                />
              </div>
            </div>

            {/* --- 第 2 列: 选择资料 (col-span-4) --- */}
            {/* (DocumentSelection 自带样式, 无需 "box") */}
            <div className="col-span-4 bg-white rounded-lg shadow p-4 overflow-y-auto">
              <DocumentSelection
                treeNodes={treeNodes}
                expandedNodes={expandedNodes}
                selectedNode={selectedNode}
                onToggleNode={handleToggleNode}
                onSelectNode={setSelectedNode}
                documentSearchQuery={documentSearchQuery}
                onDocumentSearchChange={setDocumentSearchQuery}
                selectedDocuments={selectedDocuments}
                onToggleDocumentSelection={handleToggleDocumentSelection}
                onAddDocumentToReport={handleAddDocumentToReport}
                selectedReportNode={selectedReportNode}
                editingNodeId={editingNodeId}
                editingNodeName={editingNodeName}
                onSetEditingNodeId={setEditingNodeId}
                onSetEditingNodeName={setEditingNodeName}
                onUpdateNodeName={handleUpdateDocumentNodeName}
                onAddDocumentsToReport={handleAddDocumentsToReport}
                onDocumentSelectionUpload={onDocumentSelectionUpload} // <--- 修改
              />
            </div>

            {/* --- 第 3 列: 报告信息 (col-span-5) --- */}
            {/* (ReportInfo 自带样式, 无需 "box") */}
            <div className="col-span-5 bg-white rounded-lg shadow p-6 overflow-y-auto">
              <ReportInfo
                reportName={reportName}
                setReportName={setReportName}
                styleDocFiles={styleDocFiles}
                biddingFiles={biddingFiles}
                onReportInfoUpload={onReportInfoUpload} // <--- 修改
                onRemoveStyleFile={handleRemoveStyleFile}
                onRemoveBiddingFile={handleRemoveBiddingFile}
                onGenerateReport={handleGenerateReport}
                onBackToList={handleBackToList}
                onRegenerateReport={handleRegenerateReport}
                currentView={currentView}
                isGenerating={isGenerating}
                reportUrl={reportUrl}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- Modals (保持不变) --- */}
      <NewReportFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        folderName={folderName}
        setFolderName={setFolderName}
        parentFolder={parentFolder}
        onCreateFolder={() => {
          handleCreateReportFolder(parentFolder, folderName)
          setShowNewFolderModal(false)
          setFolderName("")
          setParentFolder(null)
        }}
        getReportNodePath={(nodeId) => getReportNodePath(reportStructure, nodeId)}
      />

      <CreateLibraryDirectoryModal
        isOpen={showCreateLibraryModal}
        onClose={() => setShowCreateLibraryModal(false)}
        directoryName={libraryDirectoryName}
        setDirectoryName={setLibraryDirectoryName}
        onCreateDirectory={() => {
          handleCreateLibraryDirectory(libraryDirectoryName)
          setShowCreateLibraryModal(false)
          setLibraryDirectoryName("")
        }}
      />
    </>
  )
}