"use client"

import { FileText, Plus, Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import { DocumentNode } from "./types"
import { ConfirmDialog } from "./confirm-dialog"

interface MyUploadsTreeProps {
  nodes: DocumentNode[]
  onAddDocumentToReport: (docId: string) => void
  editingNodeId: string | null
  editingNodeName: string
  onSetEditingNodeId: (nodeId: string | null) => void
  onSetEditingNodeName: (name: string) => void
  onUpdateMyUploadsNodeName: (nodeId: string, newName: string) => void
  onDeleteMyUploadsNode: (nodeId: string) => void
  // 添加勾选功能相关属性
  selectedDocuments: Set<string>
  onToggleDocumentSelection: (docId: string) => void
}

export function MyUploadsTree({
  nodes,
  onAddDocumentToReport,
  editingNodeId,
  editingNodeName,
  onSetEditingNodeId,
  onSetEditingNodeName,
  onUpdateMyUploadsNodeName,
  onDeleteMyUploadsNode,
  // 添加勾选功能相关属性
  selectedDocuments,
  onToggleDocumentSelection,
}: MyUploadsTreeProps) {
  // 添加状态管理确认对话框
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)

  // 过滤掉文件夹（如果未来可能添加的话），只显示文件
  const fileNodes = nodes.filter(node => node.type === 'file');

  const handleSaveName = (nodeId: string) => {
    if (editingNodeName.trim()) {
      onUpdateMyUploadsNodeName(nodeId, editingNodeName.trim())
    }
    onSetEditingNodeId(null)
  }

  const handleDeleteClick = (nodeId: string, nodeName: string) => {
    setNodeToDelete(nodeId)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (nodeToDelete) {
      onDeleteMyUploadsNode(nodeToDelete)
      setNodeToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">我的上传</h3>
      <div className="flex-1 overflow-auto -mr-4 pr-4 space-y-2">
        {fileNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            暂无上传文件
          </div>
        ) : (
          fileNodes.map((node) => {
            const isEditing = editingNodeId === node.id

            return (
              <div
                key={node.id}
                className="flex items-center py-1.5 px-2 hover:bg-gray-100 rounded"
              >
                {/* 添加复选框 */}
                <input
                  type="checkbox"
                  checked={selectedDocuments.has(node.id)}
                  onChange={() => onToggleDocumentSelection(node.id)}
                  className="mr-2"
                />
                <FileText size={16} className="mr-2 text-gray-500 shrink-0" />
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editingNodeName}
                    onChange={(e) => onSetEditingNodeName(e.target.value)}
                    onBlur={() => handleSaveName(node.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName(node.id)
                      else if (e.key === "Escape") onSetEditingNodeId(null)
                    }}
                    className="flex-1 px-1 py-0.5 text-sm border border-blue-400 rounded"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 text-sm truncate" title={node.name}>
                    {node.name}
                  </span>
                )}
                
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddDocumentToReport(node.id) // <-- 关键：调用此函数添加到报告
                    }}
                    className="p-0.5 text-gray-400 hover:text-green-600 rounded"
                    title="添加到报告"
                  >
                    <Plus size={14} />
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
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(node.id, node.name)
                    }}
                    className="p-0.5 text-gray-400 hover:text-red-600 rounded"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="确认删除"
        description={`确定要删除文件"${nodes.find(n => n.id === nodeToDelete)?.name}"吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}