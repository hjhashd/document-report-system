"use client"

import { ReportNode } from "./types"

export const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = "copy"
}

export const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault()
}

export const handleDrop = (
  e: React.DragEvent,
  targetNode: ReportNode,
  draggedNode: ReportNode | null,
  reportStructure: ReportNode[],
  setReportStructure: (structure: ReportNode[]) => void,
  expandedReportNodes: Set<string>,
  setExpandedReportNodes: (nodes: Set<string>) => void,
  setDraggedNode: (node: ReportNode | null) => void
) => {
  e.preventDefault()
  
  if (!draggedNode || draggedNode.id === targetNode.id) return

  // Check if target is a folder
  if (targetNode.type !== "folder") return

  // Check if dragged node is a child of target node (prevent circular reference)
  const isChildOfTarget = (node: ReportNode, targetId: string): boolean => {
    if (node.id === targetId) return true
    if (node.children) {
      return node.children.some(child => isChildOfTarget(child, targetId))
    }
    return false
  }

  if (isChildOfTarget(draggedNode, targetNode.id)) return

  // Remove dragged node from its current position
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

  // Add dragged node to target
  const addToTarget = (nodes: ReportNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === targetNode.id && node.type === "folder") {
        node.children = node.children || []
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

  // Expand the target node to show the newly added item
  setExpandedReportNodes(new Set([...expandedReportNodes, targetNode.id]))
  setDraggedNode(null)
}