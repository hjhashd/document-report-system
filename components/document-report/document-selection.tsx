"use client"

import { useState } from "react"
import {
  FilePlus,
  FolderPlus,
  Search,
  Plus,
  ArrowRight,
  Check,
  Upload,
} from "lucide-react"
import { DocumentTree } from "./document-tree"

interface DocumentSelectionProps {
  treeNodes: any[]
  expandedNodes: Set<string>
  selectedNode: string | null
  onToggleNode: (nodeId: string) => void
  onSelectNode: (nodeId: string) => void
  documentSearchQuery: string
  onDocumentSearchChange: (query: string) => void
  selectedDocuments: Set<string>
  onToggleDocumentSelection: (docId: string) => void
  onAddDocumentToReport: (docId: string) => void
  selectedReportNode: string | null
  editingNodeId: string | null
  editingNodeName: string
  onSetEditingNodeId: (nodeId: string | null) => void
  onSetEditingNodeName: (name: string) => void
  onUpdateNodeName: (nodeId: string, newName: string) => void
  onAddDocumentsToReport: () => void
  onAddFolderDocumentsToReport: (folderId: string) => void
  onDocumentSelectionUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  
  // --- ↓↓↓ 新增的 State 和 Handlers ↓↓↓ ---
  myUploadsNodes: any[]
  onUpdateMyUploadsNodeName: (nodeId: string, newName: string) => void
  onDeleteMyUploadsNode: (nodeId: string) => void
  onAddDocumentToReportFromMyUploads: (docId: string) => void
  myUploadsSearchQuery: string
  onMyUploadsSearchChange: (query: string) => void
  // --- ↑↑↑ 新增结束 ↑↑↑ ---
}

export function DocumentSelection({
  treeNodes,
  expandedNodes,
  selectedNode,
  onToggleNode,
  onSelectNode,
  documentSearchQuery,
  onDocumentSearchChange,
  selectedDocuments,
  onToggleDocumentSelection,
  onAddDocumentToReport,
  selectedReportNode,
  editingNodeId,
  editingNodeName,
  onSetEditingNodeId,
  onSetEditingNodeName,
  onUpdateNodeName,
  onAddDocumentsToReport,
  onAddFolderDocumentsToReport,
  onDocumentSelectionUpload, // <--- 新增
  
  // --- ↓↓↓ 新增的 State 和 Handlers ↓↓↓ ---
  myUploadsNodes,
  onUpdateMyUploadsNodeName,
  onDeleteMyUploadsNode,
  onAddDocumentToReportFromMyUploads,
  myUploadsSearchQuery,
  onMyUploadsSearchChange,
  // --- ↑↑↑ 新增结束 ↑↑↑ ---
}: DocumentSelectionProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [parentFolder, setParentFolder] = useState<string | null>(null)
  
  // --- ↓↓↓ 新增状态：用于切换视图 ↓↓↓ ---
  // 添加视图切换状态
  const [activeView, setActiveView] = useState<"library" | "myUploads">("library")
  
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onDocumentSelectionUpload(e)
      // 上传后自动切换到"我的上传"视图
      setActiveView("myUploads")
    }
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium mb-3">文档选择</h3>
        
        {/* 视图切换标签 */}
        <div className="flex space-x-1 mb-3">
          <button
            onClick={() => setActiveView("library")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeView === "library"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            资料库
          </button>
          <button
            onClick={() => setActiveView("myUploads")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeView === "myUploads"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            我的上传
          </button>
        </div>
        
        {/* 搜索框 - 根据当前视图显示不同的搜索框 */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeView === "library" ? "搜索文档..." : "搜索我的上传..."}
            value={activeView === "library" ? documentSearchQuery : myUploadsSearchQuery}
            onChange={(e) => 
              activeView === "library" 
                ? onDocumentSearchChange(e.target.value)
                : onMyUploadsSearchChange(e.target.value)
            }
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* 上传按钮 */}
        <div className="flex items-center space-x-2">
          <label className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
            <Upload size={14} className="inline mr-1" />
            上传文档
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleUploadFile}
            />
          </label>
          <span className="text-xs text-gray-500">支持多选</span>
        </div>
      </div>
      
      {/* 文档树 */}
      <div className="flex-1">
        {activeView === "library" ? (
          <DocumentTree
            treeNodes={treeNodes}
            expandedNodes={expandedNodes}
            selectedNode={selectedNode}
            onToggleNode={onToggleNode}
            onSelectNode={onSelectNode}
            documentSearchQuery={documentSearchQuery}
            onDocumentSearchChange={onDocumentSearchChange}
            selectedDocuments={selectedDocuments}
            onToggleDocumentSelection={onToggleDocumentSelection}
            onAddDocumentToReport={onAddDocumentToReport}
            onAddFolderDocumentsToReport={onAddFolderDocumentsToReport}
            selectedReportNode={selectedReportNode}
            editingNodeId={editingNodeId}
            editingNodeName={editingNodeName}
            onSetEditingNodeId={onSetEditingNodeId}
            onSetEditingNodeName={onSetEditingNodeName}
            onUpdateNodeName={onUpdateNodeName}
          />
        ) : (
          <DocumentTree
            treeNodes={[]} // 资料库为空
            myUploadsNodes={myUploadsNodes} // 使用我的上传节点
            expandedNodes={expandedNodes}
            selectedNode={selectedNode}
            onToggleNode={onToggleNode}
            onSelectNode={onSelectNode}
            documentSearchQuery={myUploadsSearchQuery}
            onDocumentSearchChange={onMyUploadsSearchChange}
            selectedDocuments={selectedDocuments}
            onToggleDocumentSelection={onToggleDocumentSelection}
            onAddDocumentToReport={onAddDocumentToReportFromMyUploads} // 使用我的上传添加函数
            onAddFolderDocumentsToReport={onAddFolderDocumentsToReport}
            selectedReportNode={selectedReportNode}
            editingNodeId={editingNodeId}
            editingNodeName={editingNodeName}
            onSetEditingNodeId={onSetEditingNodeId}
            onSetEditingNodeName={onSetEditingNodeName}
            onUpdateNodeName={onUpdateNodeName}
            onUpdateMyUploadsNodeName={onUpdateMyUploadsNodeName}
            onDeleteMyUploadsNode={onDeleteMyUploadsNode}
            onAddDocumentToReportFromMyUploads={onAddDocumentToReportFromMyUploads}
          />
        )}
      </div>
      
      {/* 底部操作栏 */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            已选择 {selectedDocuments.size} 个文档
          </span>
          <button
            onClick={onAddDocumentsToReport}
            disabled={selectedDocuments.size === 0}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              selectedDocuments.size > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            批量添加
          </button>
        </div>
      </div>
    </div>
  )
}