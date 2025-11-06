"use client"

import { useState, useMemo } from "react"
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
import { ConfirmDialog } from "./confirm-dialog"

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
  myUploadsNodes?: TreeNode[] // 添加"我的上传"节点
  expandedNodes: Set<string>
  selectedNode: string | null
  onToggleNode: (nodeId: string) => void
  onSelectNode: (nodeId: string) => void
  documentSearchQuery: string
  onDocumentSearchChange: (query: string) => void
  selectedDocuments: Set<string>
  onToggleDocumentSelection: (docId: string) => void
  onAddDocumentToReport: (docId: string) => void
  onAddFolderDocumentsToReport: (folderId: string) => void
  selectedReportNode: string | null
  editingNodeId: string | null
  editingNodeName: string
  onSetEditingNodeId: (nodeId: string | null) => void
  onSetEditingNodeName: (name: string) => void
  onUpdateNodeName: (nodeId: string, newName: string) => void
  // 添加"我的上传"相关的处理函数
  onUpdateMyUploadsNodeName?: (nodeId: string, newName: string) => void
  onDeleteMyUploadsNode?: (nodeId: string) => void
  onAddDocumentToReportFromMyUploads?: (docId: string) => void
}

export function DocumentTree({
  treeNodes,
  myUploadsNodes,
  expandedNodes,
  selectedNode,
  onToggleNode,
  onSelectNode,
  documentSearchQuery,
  onDocumentSearchChange,
  selectedDocuments,
  onToggleDocumentSelection,
  onAddDocumentToReport,
  onAddFolderDocumentsToReport,
  selectedReportNode,
  editingNodeId,
  editingNodeName,
  onSetEditingNodeId,
  onSetEditingNodeName,
  onUpdateNodeName,
  onUpdateMyUploadsNodeName,
  onDeleteMyUploadsNode,
  onAddDocumentToReportFromMyUploads,
}: DocumentTreeProps) {
  // 添加状态管理确认对话框
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)
  const [nodeToDeleteName, setNodeToDeleteName] = useState<string>('')

  const getNode = (id: string) => {
    // 首先在treeNodes中查找
    let node = treeNodes.find((n) => n.id === id)
    // 如果找不到，在myUploadsNodes中查找
    if (!node && myUploadsNodes) {
      node = myUploadsNodes.find((n) => n.id === id)
    }
    return node
  }

  const handleDeleteClick = (nodeId: string, nodeName: string) => {
    setNodeToDelete(nodeId)
    setNodeToDeleteName(nodeName)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (nodeToDelete && onDeleteMyUploadsNode) {
      onDeleteMyUploadsNode(nodeToDelete)
      setNodeToDelete(null)
      setNodeToDeleteName('')
    }
    setDeleteConfirmOpen(false)
  }

  // --- ↓↓↓ 搜索逻辑修复 ↓↓↓ --- 
  const matchingNodeIds = useMemo(() => {
    if (!documentSearchQuery) {
      return null; // 没有搜索词，不过滤
    }

    const lowerQuery = documentSearchQuery.toLowerCase();
    const matching = new Set<string>();
    
    // 合并所有节点进行搜索
    const allNodes = [...treeNodes];
    if (myUploadsNodes) {
      allNodes.push(...myUploadsNodes);
    }

    allNodes.forEach(node => {
      // 检查节点自身是否匹配
      const nodeMatches = 
        node.name.toLowerCase().includes(lowerQuery) || 
        (node.description && node.description.toLowerCase().includes(lowerQuery)) || 
        (node.content && typeof node.content === 'string' && node.content.toLowerCase().includes(lowerQuery));

      if (nodeMatches) {
        // 如果匹配，将它自己和所有父节点都加入集合
        let currentId: string | null | undefined = node.id;
        while (currentId) {
          if (matching.has(currentId)) break; // 避免重复计算
          matching.add(currentId);
          const parent = getNode(currentId);
          currentId = parent?.parentId;
        }
      }
    });
    return matching;
  }, [documentSearchQuery, treeNodes, myUploadsNodes]); // 依赖搜索词和节点数据
  // --- ↑↑↑ 搜索逻辑修复结束 ↑↑↑ ---

  const renderTreeNode = (nodeId: string, level = 0, isFromMyUploads = false) => {
    // --- ↓↓↓ 搜索过滤检查 ↓↓↓ ---
    // 如果正在搜索 (matchingNodeIds 不为 null)，并且当前节点不在匹配集合中，则不渲染
    if (matchingNodeIds && !matchingNodeIds.has(nodeId)) {
      return null;
    }
    // --- ↑↑↑ 检查结束 ↑↑↑ ---
    
    const node = getNode(nodeId)
    if (!node) return null

    // --- ↓↓↓ 自动展开搜索结果 ↓↓↓ ---
    // 如果在搜索，则强制展开；否则按原逻辑
    const isExpanded = matchingNodeIds ? true : expandedNodes.has(nodeId);
    // --- ↑↑↑ 自动展开结束 ↑↑↑ ---
    
    const isSelected = selectedNode === nodeId
    const isEditing = editingNodeId === nodeId
    const hasChildren = node.children && node.children.length > 0
    // 判断是否为"我的上传"中的节点
    const isMyUploadsNode = isFromMyUploads || (myUploadsNodes && myUploadsNodes.some(n => n.id === nodeId))

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
                  if (isMyUploadsNode && onUpdateMyUploadsNodeName) {
                    onUpdateMyUploadsNodeName(nodeId, editingNodeName.trim())
                  } else {
                    onUpdateNodeName(nodeId, editingNodeName.trim())
                  }
                }
                onSetEditingNodeId(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (editingNodeName.trim()) {
                    if (isMyUploadsNode && onUpdateMyUploadsNodeName) {
                      onUpdateMyUploadsNodeName(nodeId, editingNodeName.trim())
                    } else {
                      onUpdateNodeName(nodeId, editingNodeName.trim())
                    }
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
                    if (isMyUploadsNode && onAddDocumentToReportFromMyUploads) {
                      onAddDocumentToReportFromMyUploads(nodeId)
                    } else {
                      onAddDocumentToReport(nodeId)
                    }
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
              
              {isMyUploadsNode && onDeleteMyUploadsNode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(nodeId, node.name)
                  }}
                  className="p-0.5 text-gray-400 hover:text-red-600 rounded"
                  title="删除"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}
          
          {node.type === "folder" && selectedReportNode && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAddFolderDocumentsToReport(nodeId)
                }}
                className="p-0.5 text-gray-400 hover:text-green-600 rounded"
                title={`批量添加文件夹内所有文档到${selectedReportNode ? '当前选中的报告文件夹' : '根目录'}`}
              >
                <Download size={12} />
              </button>
            </div>
          )}
        </div>
        
        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((childId) => renderTreeNode(childId, level + 1, isMyUploadsNode))}
          </div>
        )}
      </div>
    )
  }

  // 根据是否为"我的上传"视图来决定根节点
  const isMyUploadsView = myUploadsNodes && myUploadsNodes.length > 0 && 
    (myUploadsNodes.length > 0 || treeNodes.length === 0)
  
  const rootNodes = isMyUploadsView 
    ? myUploadsNodes.filter((node) => !node.parentId)
    : treeNodes.filter((node) => !node.parentId)

  // --- ↓↓↓ 修改渲染逻辑 ↓↓↓ ---
  const renderedNodes = rootNodes
    .map((node) => renderTreeNode(node.id, 0, isMyUploadsView))
    .filter(Boolean); // 过滤掉被搜索过滤掉的节点
  // --- ↑↑↑ 修改渲染逻辑结束 ↑↑↑ ---

  return (
    <div className="flex flex-col h-full">
      {/* 搜索框已移除，只保留DocumentSelection中的搜索功能 */}
      
      <div className="flex-1 overflow-auto">
        {renderedNodes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {documentSearchQuery ? "未找到匹配的文档" : (isMyUploadsView ? "暂无上传文档" : "暂无文档")}
          </div>
        ) : (
          renderedNodes
        )}
      </div>
      
      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="确认删除"
        description={`确定要删除文件"${nodeToDeleteName}"吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}