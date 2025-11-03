"use client"

import { ReportNode, DocumentNode } from "./types"

export const getNode = (treeNodes: DocumentNode[], id: string): DocumentNode | undefined => {
  return treeNodes.find((n) => n.id === id)
}

export const getReportNode = (reportStructure: ReportNode[], id: string): ReportNode | null => {
  const findNode = (nodes: ReportNode[]): ReportNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNode(node.children)
        if (found) return found
      }
    }
    return null
  }
  return findNode(reportStructure)
}

export const getReportFolders = (reportStructure: ReportNode[]): ReportNode[] => {
  const folders: ReportNode[] = []
  const traverse = (nodes: ReportNode[]) => {
    nodes.forEach((node) => {
      if (node.type === "folder") {
        folders.push(node)
        if (node.children) traverse(node.children)
      }
    })
  }
  traverse(reportStructure)
  return folders
}

export const getNodePath = (treeNodes: DocumentNode[], nodeId: string): string => {
  const path: string[] = []
  let currentId = nodeId

  while (currentId) {
    const node = getNode(treeNodes, currentId)
    if (!node) break
    path.unshift(node.name)
    currentId = node.parentId || ""
  }

  return path.join(" / ") || "根目录"
}

export const getReportNodePath = (reportStructure: ReportNode[], nodeId: string): string => {
  const path: string[] = []
  const findPath = (nodes: ReportNode[], targetId: string, currentPath: string[]): string[] | null => {
    for (const node of nodes) {
      const newPath = [...currentPath, node.name]
      if (node.id === targetId) {
        return newPath
      }
      if (node.children) {
        const found = findPath(node.children, targetId, newPath)
        if (found) return found
      }
    }
    return null
  }
  const foundPath = findPath(reportStructure, nodeId, [])
  return foundPath ? foundPath.join(" / ") : "根目录"
}

export const filterDocuments = (nodes: DocumentNode[], documentSearchQuery: string): DocumentNode[] => {
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

export const deepCopyStructure = (node: ReportNode): ReportNode => {
  const newNode: ReportNode = {
    ...node,
    id: "report-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    children: node.children ? node.children.map((child) => deepCopyStructure(child)) : [],
  }
  return newNode
}

export const addDocumentToReport = (
  docId: string,
  treeNodes: DocumentNode[],
  selectedReportNode: string | null,
  reportStructure: ReportNode[],
  setReportStructure: (structure: ReportNode[]) => void
) => {
  const doc = getNode(treeNodes, docId)
  if (!doc || doc.type !== "file") {
    alert("请选择一个资料文件")
    return
  }

  if (!selectedReportNode) {
    alert("请先选择报告目录位置")
    return
  }

  const reportNode = getReportNode(reportStructure, selectedReportNode)
  if (!reportNode || reportNode.type !== "folder") {
    alert("请选择一个报告目录")
    return
  }

  const checkExists = (children: ReportNode[]): boolean => {
    return children.some((child) => child.sourceId === docId || (child.children && checkExists(child.children)))
  }

  if (checkExists(reportNode.children)) {
    alert("该资料已添加到此目录或其子目录中")
    return
  }

  const newDocRef: ReportNode = {
    id: "report-doc-" + Date.now(),
    name: doc.name,
    type: "file",
    sourceId: docId,
    description: doc.description,
    content: doc.content,
  }

  const addToNode = (nodes: ReportNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === selectedReportNode) {
        node.children.push(newDocRef)
        return true
      }
      if (node.children && addToNode(node.children)) {
        return true
      }
    }
    return false
  }

  const newStructure = [...reportStructure]
  addToNode(newStructure)
  setReportStructure(newStructure)
}

export const addDocumentsToReport = (
  selectedDocuments: Set<string>,
  treeNodes: DocumentNode[],
  selectedReportNode: string | null,
  reportStructure: ReportNode[],
  setReportStructure: (structure: ReportNode[]) => void,
  setSelectedDocuments: (documents: Set<string>) => void
) => {
  if (selectedDocuments.size === 0) {
    alert("请先选择要添加的资料")
    return
  }
  if (!selectedReportNode) {
    alert("请先选择报告中的目标目录")
    return
  }

  const reportNode = getReportNode(reportStructure, selectedReportNode)
  if (!reportNode || reportNode.type !== "folder") {
    alert("请选择一个报告文件夹")
    return
  }

  const newStructure = [...reportStructure]
  let addedCount = 0

  selectedDocuments.forEach((docId) => {
    const doc = getNode(treeNodes, docId)
    if (!doc || doc.type !== "file") return

    const checkExists = (children: ReportNode[]): boolean => {
      return children.some((child) => child.sourceId === docId || (child.children && checkExists(child.children)))
    }

    if (checkExists(reportNode.children)) {
      console.warn(`Document ${doc.name} already exists in the selected report folder.`)
      return
    }

    const newDocRef: ReportNode = {
      id: "report-doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: doc.name,
      type: "file",
      sourceId: docId,
      description: doc.description,
      content: doc.content,
    }

    const addToNode = (nodes: ReportNode[]): boolean => {
      for (const node of nodes) {
        if (node.id === selectedReportNode) {
          node.children.push(newDocRef)
          return true
        }
        if (node.children && addToNode(node.children)) {
          return true
        }
      }
      return false
    }

    if (addToNode(newStructure)) {
      addedCount++
    }
  })

  setReportStructure(newStructure)
  setSelectedDocuments(new Set())
  alert(`成功添加 ${addedCount} 个资料到报告！`)
}

export const deleteReportNode = (
  nodeId: string,
  reportStructure: ReportNode[],
  setReportStructure: (structure: ReportNode[]) => void,
  selectedReportNode: string | null,
  setSelectedReportNode: (nodeId: string | null) => void
) => {
  if (!window.confirm("确定要删除此项吗？")) return

  const removeNode = (nodes: ReportNode[]): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === nodeId) {
        nodes.splice(i, 1)
        return true
      }
      if (nodes[i].children && removeNode(nodes[i].children)) {
        return true
      }
    }
    return false
  }

  const newStructure = [...reportStructure]
  removeNode(newStructure)
  setReportStructure(newStructure)
  if (selectedReportNode === nodeId) {
    setSelectedReportNode(null)
  }
}

export const saveEditedNodeName = (
  editingNodeId: string | null,
  editingNodeName: string,
  reportStructure: ReportNode[],
  setReportStructure: (structure: ReportNode[]) => void,
  setEditingNodeId: (nodeId: string | null) => void,
  setEditingNodeName: (name: string) => void
) => {
  if (!editingNodeName.trim()) {
    alert("目录名称不能为空")
    return
  }

  const updateNodeName = (nodes: ReportNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === editingNodeId) {
        node.name = editingNodeName.trim()
        return true
      }
      if (node.children && updateNodeName(node.children)) {
        return true
      }
    }
    return false
  }

  const newStructure = [...reportStructure]
  updateNodeName(newStructure)
  setReportStructure(newStructure)
  setEditingNodeId(null)
  setEditingNodeName("")
}

export const handleDragDrop = (
  draggedNode: ReportNode | null,
  targetNode: ReportNode,
  reportStructure: ReportNode[],
  setReportStructure: (structure: ReportNode[]) => void,
  expandedReportNodes: Set<string>,
  setExpandedReportNodes: (nodes: Set<string>) => void,
setDraggedNode: (node: ReportNode | null) => void // <-- 增加这个参数
) => {
  if (!draggedNode || draggedNode.id === targetNode.id) return

  const removeNode = (nodes: ReportNode[]): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === draggedNode.id) {
        nodes.splice(i, 1)
        return true
      }
      if (nodes[i].children && removeNode(nodes[i].children)) {
        return true
      }
    }
    return false
  }

  const addToTarget = (nodes: ReportNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === targetNode.id && node.type === "folder") {
        node.children.push(draggedNode)
        return true
      }
      if (node.children && addToTarget(node.children)) {
        return true
      }
    }
    return false
  }

  const newStructure = [...reportStructure]
  removeNode(newStructure)
  addToTarget(newStructure)
  setReportStructure(newStructure)

  setExpandedReportNodes(new Set([...expandedReportNodes, targetNode.id]))
setDraggedNode(null) 
}