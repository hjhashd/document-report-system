"use client"

import { useState } from "react"
import {
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Eye,
  Plus,
  Download,
  ArrowRight,
  Trash2,
  Copy,
  Edit2,
  Search,
  Upload,
  X,
  ArrowLeft,
  HelpCircle,
} from "lucide-react"
import { toast } from "sonner"

interface TreeNode {
  id: string
  name: string
  type: "folder" | "file"
  parentId?: string | null
  children?: string[]
  uploadDate?: string
  description?: string
  content?: string
  fileSize?: number
}

interface DocumentTreeProps {
  treeNodes: TreeNode[]
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
}

export function DocumentTree({
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
}: DocumentTreeProps) {
  const getNode = (id: string) => treeNodes.find((n) => n.id === id)
  
  const filterDocuments = (nodes: TreeNode[]) => {
    if (!documentSearchQuery) {
      return nodes
    }
    return nodes.filter((node) => {
      const matchesQuery =
        node.name.toLowerCase().includes(documentSearchQuery.toLowerCase()) ||
        (node.description && node.description.toLowerCase().includes(documentSearchQuery.toLowerCase())) ||
        (node.content && node.content.toLowerCase().includes(documentSearchQuery.toLowerCase()))
      return matchesQuery
    })
  }

  const renderTreeNode = (nodeId: string, level = 0) => {
    const node = getNode(nodeId)
    if (!node) return null

    const isExpanded = expandedNodes.has(nodeId)
    const isSelected = selectedNode === nodeId
    const isEditing = editingNodeId === nodeId
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={nodeId} className="select-none">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer ${
            isSelected ? "bg-blue-50" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelectNode(nodeId)}
        >
          {node.type === "folder" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleNode(nodeId)
              }}
              className="mr-1 p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          
          {node.type === "folder" ? (
            <Folder size={16} className="mr-2 text-blue-500" />
          ) : (
            <File size={16} className="mr-2 text-gray-500" />
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editingNodeName}
              onChange={(e) => onSetEditingNodeName(e.target.value)}
              onBlur={() => {
                if (editingNodeName.trim()) {
                  onUpdateNodeName(nodeId, editingNodeName.trim())
                }
                onSetEditingNodeId(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (editingNodeName.trim()) {
                    onUpdateNodeName(nodeId, editingNodeName.trim())
                  }
                  onSetEditingNodeId(null)
                } else if (e.key === "Escape") {
                  onSetEditingNodeId(null)
                }
              }}
              className="flex-1 px-1 py-0.5 text-sm border border-blue-400 rounded"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm truncate">{node.name}</span>
          )}
          
          {node.type === "file" && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleDocumentSelection(nodeId)
                }}
                className={`p-0.5 rounded ${
                  selectedDocuments.has(nodeId)
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="选择/取消选择"
              >
                <Plus size={12} />
              </button>
              
              {selectedReportNode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddDocumentToReport(nodeId)
                  }}
                  className="p-0.5 text-gray-400 hover:text-green-600 rounded"
                  title="添加到报告"
                >
                  <ArrowRight size={12} />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSetEditingNodeId(nodeId)
                  onSetEditingNodeName(node.name)
                }}
                className="p-0.5 text-gray-400 hover:text-blue-600 rounded"
                title="重命名"
              >
                <Edit2 size={12} />
              </button>
            </div>
          )}
        </div>
        
        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((childId) => renderTreeNode(childId, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const rootNodes = treeNodes.filter((node) => !node.parentId)
  const filteredRootNodes = filterDocuments(rootNodes)

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search size={16} className="absolute left-2 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索文档..."
            value={documentSearchQuery}
            onChange={(e) => onDocumentSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-3">
        {filteredRootNodes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {documentSearchQuery ? "未找到匹配的文档" : "暂无文档"}
          </div>
        ) : (
          filteredRootNodes.map((node) => renderTreeNode(node.id))
        )}
      </div>
      
      {selectedDocuments.size > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              已选择 {selectedDocuments.size} 个文档
            </span>
            <button
              onClick={() => {
                // 这里应该实现批量添加到报告的逻辑
                toast("批量添加功能待实现")
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              批量添加
            </button>
          </div>
        </div>
      )}
    </div>
  )
}