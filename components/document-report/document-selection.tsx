"use client"

import { useState } from "react"
import {
  FilePlus,
  FolderPlus,
  Search,
  Plus,
  ArrowRight,
  Check,
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
}: DocumentSelectionProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [parentFolder, setParentFolder] = useState<string | null>(null)

  const handleCreateFolder = () => {
    if (!folderName.trim()) return
    // This would be handled by the parent component
    console.log("Creating folder:", folderName, "Parent:", parentFolder)
    setShowCreateFolderModal(false)
    setFolderName("")
    setParentFolder(null)
  }

  const handleUploadFile = () => {
    // This would be handled by the parent component
    console.log("Uploading file")
    setShowUploadModal(false)
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">选择资料</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
            title="上传文件"
          >
            <FilePlus size={16} />
          </button>
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
            title="新建文件夹"
          >
            <FolderPlus size={16} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索资料..."
            value={documentSearchQuery}
            onChange={(e) => onDocumentSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="border rounded-md h-96 overflow-hidden">
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
          selectedReportNode={selectedReportNode}
          editingNodeId={editingNodeId}
          editingNodeName={editingNodeName}
          onSetEditingNodeId={onSetEditingNodeId}
          onSetEditingNodeName={onSetEditingNodeName}
          onUpdateNodeName={onUpdateNodeName}
        />
      </div>

      {selectedDocuments.size > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-blue-600" />
              <span className="text-sm text-blue-800">
                已选择 {selectedDocuments.size} 个资料
              </span>
            </div>
            <button
              onClick={onAddDocumentsToReport}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              <span>添加 {selectedDocuments.size} 个资料到报告</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">上传文件</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">选择文件</label>
              <input
                type="file"
                multiple
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleUploadFile}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                上传
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新建文件夹</h3>
              <button onClick={() => setShowCreateFolderModal(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">文件夹名称</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="例如：技术文档"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}