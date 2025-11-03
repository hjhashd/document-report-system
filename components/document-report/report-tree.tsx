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
  FileText,
} from "lucide-react"
import { ReportNode } from "./types"
import { handleDragOver, handleDragLeave, handleDrop } from "./drag-drop-operations"

interface ReportTreeProps {
  reportStructure: ReportNode[]
  expandedReportNodes: Set<string>
  selectedReportNode: string | null
  onToggleReportNode: (nodeId: string) => void
  onSelectReportNode: (nodeId: string | null) => void
  onDeleteReportNode: (nodeId: string) => void
  onCreateReportFolder: (parentId: string | null, name: string) => void
  editingNodeId: string | null
  editingNodeName: string
  onSetEditingNodeId: (nodeId: string | null) => void
  onSetEditingNodeName: (name: string) => void
  onSaveEditedNodeName: () => void
  draggedNode: ReportNode | null
  onSetDraggedNode: (node: ReportNode | null) => void
  getReportNodePath: (nodeId: string) => string
  setReportStructure: (structure: ReportNode[]) => void
  setExpandedReportNodes: (nodes: Set<string>) => void
}

export function ReportTree({
  reportStructure,
  expandedReportNodes,
  selectedReportNode,
  onToggleReportNode,
  onSelectReportNode,
  onDeleteReportNode,
  onCreateReportFolder,
  editingNodeId,
  editingNodeName,
  onSetEditingNodeId,
  onSetEditingNodeName,
  onSaveEditedNodeName,
  draggedNode,
  onSetDraggedNode,
  getReportNodePath,
  setReportStructure,
  setExpandedReportNodes,
}: ReportTreeProps) {
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderParent, setNewFolderParent] = useState<string | null>(null)

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    onCreateReportFolder(newFolderParent, newFolderName)
    setShowNewFolderModal(false)
    setNewFolderName("")
    setNewFolderParent(null)
  }

  const handleRightClick = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault()
    onSelectReportNode(nodeId)
    setNewFolderParent(nodeId)
    setShowNewFolderModal(true)
  }

  const handleRightClickOnEmpty = (e: React.MouseEvent) => {
    e.preventDefault()
    setNewFolderParent(null)
    setShowNewFolderModal(true)
  }

  const renderReportNode = (node: ReportNode, level = 0) => {
    const isExpanded = expandedReportNodes.has(node.id)
    const isSelected = selectedReportNode === node.id
    const isEditing = editingNodeId === node.id
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer ${
            isSelected ? "bg-blue-50" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelectReportNode(node.id)}
          onContextMenu={(e) => handleRightClick(e, node.id)}
          draggable={node.type === "folder"}
          onDragStart={(e) => {
            if (node.type === "folder") {
              onSetDraggedNode(node)
              e.dataTransfer.effectAllowed = "move"
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            handleDrop(
              e,
              node,
              draggedNode,
              reportStructure,
              setReportStructure,
              expandedReportNodes,
              setExpandedReportNodes,
              onSetDraggedNode
            )
          }}
        >
          {node.type === "folder" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleReportNode(node.id)
              }}
              className="mr-1 p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          
          {node.type === "folder" ? (
            <Folder size={16} className="mr-2 text-blue-500" />
          ) : (
            <FileText size={16} className="mr-2 text-gray-500" />
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editingNodeName}
              onChange={(e) => onSetEditingNodeName(e.target.value)}
              onBlur={onSaveEditedNodeName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSaveEditedNodeName()
                } else if (e.key === "Escape") {
                  onSetEditingNodeId(null)
                  onSetEditingNodeName("")
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
                  setNewFolderParent(node.id)
                  setNewFolderName("")
                  setShowNewFolderModal(true)
                }}
                className="p-0.5 text-gray-400 hover:text-green-600 rounded"
                title="新建子目录"
              >
                <Plus size={12} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSetEditingNodeId(node.id)
                  onSetEditingNodeName(node.name)
                }}
                className="p-0.5 text-gray-400 hover:text-blue-600 rounded"
                title="重命名"
              >
                <Edit2 size={12} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteReportNode(node.id)
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
            {node.children.map((child) => renderReportNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">当前报告目录</h3>
          <button
            onClick={() => {
              setNewFolderParent(null)
              setNewFolderName("")
              setShowNewFolderModal(true)
            }}
            className="p-1 text-gray-500 hover:text-blue-600 rounded"
            title="新建根目录"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      
      <div
        className="flex-1 overflow-auto p-3"
        onContextMenu={handleRightClickOnEmpty}
      >
        {reportStructure.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无目录，右键或点击+按钮创建
          </div>
        ) : (
          reportStructure.map((node) => renderReportNode(node))
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新建报告目录</h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">目录名称</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="例如：第一章 概述"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {newFolderParent && (
                <p className="text-xs text-gray-500 mt-1">
                  父目录: {getReportNodePath(newFolderParent)}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewFolderModal(false)}
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