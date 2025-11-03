"use client"

import { useState } from "react"
import {
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Folder,
  Plus,
  Copy,
  Edit2,
  Trash2,
  ArrowRight,
} from "lucide-react"
import { ReportNode } from "./types"
import { deepCopyStructure } from "./tree-operations"
import { ApplyToReportModal } from "./apply-to-report-modal"

interface ReportLibraryProps {
  reportLibrary: ReportNode[]
  expandedLibraryNodes: Set<string>
  onToggleLibraryNode: (nodeId: string) => void
  onApplyDirectory: (nodeId: string, name: string, targetParentId: string | null) => void
  onBatchApplyDirectories: (prefix: string, targetParentId: string | null) => void
  onCreateLibraryDirectory: (name: string) => void
  onDeleteLibraryDirectory: (nodeId: string) => void
  onEditLibraryDirectory: (nodeId: string, name: string) => void
  getReportNodePath: (nodeId: string) => string
  reportFolders: ReportNode[]
}

export function ReportLibrary({
  reportLibrary,
  expandedLibraryNodes,
  onToggleLibraryNode,
  onApplyDirectory,
  onBatchApplyDirectories,
  onCreateLibraryDirectory,
  onDeleteLibraryDirectory,
  onEditLibraryDirectory,
  getReportNodePath,
  reportFolders,
}: ReportLibraryProps) {
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showBatchApplyModal, setShowBatchApplyModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLibraryNode, setSelectedLibraryNode] = useState<string | null>(null)
  const [directoryName, setDirectoryName] = useState("")
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null)
  const [editingLibraryNode, setEditingLibraryNode] = useState<string | null>(null)
  const [editingLibraryName, setEditingLibraryName] = useState("")

  const handleApplyDirectory = (nodeId: string) => {
    const node = findLibraryNode(nodeId)
    if (!node) return
    
    setSelectedLibraryNode(nodeId)
    setDirectoryName(node.name)
    setShowApplyModal(true)
  }

  const handleBatchApplyDirectories = () => {
    setDirectoryName("")
    setShowBatchApplyModal(true)
  }

  const confirmSingleApply = () => {
    if (!selectedLibraryNode || !directoryName.trim()) return
    onApplyDirectory(selectedLibraryNode, directoryName, selectedDirectory)
    setShowApplyModal(false)
    setSelectedLibraryNode(null)
    setDirectoryName("")
    setSelectedDirectory(null)
  }

  const confirmBatchApply = () => {
    if (!directoryName.trim()) return
    onBatchApplyDirectories(directoryName, selectedDirectory)
    setShowBatchApplyModal(false)
    setDirectoryName("")
    setSelectedDirectory(null)
  }

  const handleCreateLibraryDirectory = () => {
    if (!directoryName.trim()) return
    onCreateLibraryDirectory(directoryName)
    setShowCreateModal(false)
    setDirectoryName("")
  }

  const handleDeleteLibraryDirectory = (nodeId: string) => {
    if (!window.confirm("确定要删除此目录吗？")) return
    onDeleteLibraryDirectory(nodeId)
  }

  const handleEditLibraryDirectory = (nodeId: string) => {
    const node = findLibraryNode(nodeId)
    if (!node) return
    
    setEditingLibraryNode(nodeId)
    setEditingLibraryName(node.name)
  }

  const saveLibraryDirectoryEdit = () => {
    if (!editingLibraryNode || !editingLibraryName.trim()) return
    onEditLibraryDirectory(editingLibraryNode, editingLibraryName)
    setEditingLibraryNode(null)
    setEditingLibraryName("")
  }

  const findLibraryNode = (nodeId: string): ReportNode | null => {
    const findNode = (nodes: ReportNode[]): ReportNode | null => {
      for (const node of nodes) {
        if (node.id === nodeId) return node
        if (node.children) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return null
    }
    return findNode(reportLibrary)
  }

  const renderLibraryNode = (node: ReportNode, level = 0) => {
    const isExpanded = expandedLibraryNodes.has(node.id)
    const isEditing = editingLibraryNode === node.id
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          draggable={node.type === "folder"}
          onDragStart={(e) => {
            if (node.type === "folder") {
              e.dataTransfer.setData("text/plain", node.id)
              e.dataTransfer.effectAllowed = "copy"
            }
          }}
        >
          {node.type === "folder" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleLibraryNode(node.id)
              }}
              className="mr-1 p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          
          {node.type === "folder" ? (
            <Folder size={16} className="mr-2 text-blue-500" />
          ) : (
            <FolderOpen size={16} className="mr-2 text-gray-500" />
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editingLibraryName}
              onChange={(e) => setEditingLibraryName(e.target.value)}
              onBlur={saveLibraryDirectoryEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveLibraryDirectoryEdit()
                } else if (e.key === "Escape") {
                  setEditingLibraryNode(null)
                  setEditingLibraryName("")
                }
              }}
              className="flex-1 px-1 py-0.5 text-sm border border-blue-400 rounded"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm truncate">{node.name}</span>
          )}
          
          {node.type === "folder" && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleApplyDirectory(node.id)
                }}
                className="p-0.5 text-gray-400 hover:text-green-600 rounded"
                title="应用到报告"
              >
                <ArrowRight size={12} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditLibraryDirectory(node.id)
                }}
                className="p-0.5 text-gray-400 hover:text-blue-600 rounded"
                title="重命名"
              >
                <Edit2 size={12} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteLibraryDirectory(node.id)
                }}
                className="p-0.5 text-gray-400 hover:text-red-600 rounded"
                title="删除"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
        
        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderLibraryNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium">报告目录库</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1 text-gray-500 hover:text-blue-600 rounded"
            title="新建目录"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleBatchApplyDirectories}
            className="p-1 text-gray-500 hover:text-green-600 rounded"
            title="批量应用"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-3">
        {reportLibrary.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无目录模板
          </div>
        ) : (
          reportLibrary.map((node) => renderLibraryNode(node))
        )}
      </div>

      {/* Apply to Report Modal */}
      <ApplyToReportModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        applyType="single"
        directoryName={directoryName}
        setDirectoryName={setDirectoryName}
        selectedDirectory={selectedDirectory}
        setSelectedDirectory={setSelectedDirectory}
        reportFolders={reportFolders}
        onConfirm={confirmSingleApply}
      />

      {/* Batch Apply to Report Modal */}
      <ApplyToReportModal
        isOpen={showBatchApplyModal}
        onClose={() => setShowBatchApplyModal(false)}
        applyType="batch"
        directoryName={directoryName}
        setDirectoryName={setDirectoryName}
        selectedDirectory={selectedDirectory}
        setSelectedDirectory={setSelectedDirectory}
        reportFolders={reportFolders}
        onConfirm={confirmBatchApply}
      />

      {/* Create Library Directory Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新建资料目录</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">目录名称</label>
              <input
                type="text"
                value={directoryName}
                onChange={(e) => setDirectoryName(e.target.value)}
                placeholder="例如：技术文档"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleCreateLibraryDirectory}
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