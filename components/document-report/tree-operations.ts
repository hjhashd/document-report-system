"use client"

import { ReportNode, DocumentNode } from "./types"
import { toast } from "sonner"

// --- 新增一个辅助函数 ---
// 功能：使用 FileReader 异步读取文件内容
export const readFileContent = (file: File): Promise<{ content: string | ArrayBuffer, fileType: string }> => {
  return new Promise((resolve, reject) => {
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    // 1. 文本类文件
    if (fileType.startsWith("text/") || fileName.endsWith(".md")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve({ content: e.target?.result as string, fileType: fileType })
      }
      reader.onerror = reject
      reader.readAsText(file)
    
    // 2. PDF, Word, Excel 等二进制文件
    } else if (
      fileType === "application/pdf" || 
      fileType.includes("officedocument") || // .docx, .xlsx
      fileType.includes("msword") || // .doc
      fileType.includes("excel") // .xls
    ) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        
        // 对于 PDF 文件，创建一个新的 ArrayBuffer 副本以避免 "already detached" 错误
        if (fileType === "application/pdf" && arrayBuffer) {
          try {
            // 创建一个新的 Uint8Array 副本
            const uint8Array = new Uint8Array(arrayBuffer)
            // 从 Uint8Array 创建一个新的 ArrayBuffer
            const newArrayBuffer = uint8Array.buffer.slice(0)
            resolve({ content: newArrayBuffer, fileType: fileType })
          } catch (error) {
            console.error("Error creating PDF ArrayBuffer copy:", error)
            // 如果创建副本失败，使用原始 ArrayBuffer
            resolve({ content: arrayBuffer, fileType: fileType })
          }
        } else {
          // 对于其他文件类型，使用原始 ArrayBuffer
          resolve({ content: arrayBuffer, fileType: fileType })
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file) // <-- 读为 ArrayBuffer
    
    } else {
      // 3. 其他 (如图片等)
      console.warn(`不支持的文件类型: ${fileName} (${fileType})`)
      resolve({ content: `[不支持预览的文件: ${fileName}]`, fileType: "unsupported" })
    }
  })
}

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
    toast.dismiss()
    toast("请选择一个资料文件", { className: 'toast-base toast-error' })
    return
  }

  if (!selectedReportNode) {
    toast.dismiss()
    toast("请先选择报告目录位置", { className: 'toast-base toast-error' })
    return
  }

  const reportNode = getReportNode(reportStructure, selectedReportNode)
  if (!reportNode || reportNode.type !== "folder") {
    toast.dismiss()
    toast("请选择一个报告目录", { className: 'toast-base toast-error' })
    return
  }

  const checkExists = (children: ReportNode[]): boolean => {
    return children.some((child) => child.sourceId === docId || (child.children && checkExists(child.children)))
  }

  if (checkExists(reportNode.children)) {
    toast.dismiss()
    toast("该资料已添加到此目录或其子目录中", { className: 'toast-base toast-info' })
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
  if (addToNode(newStructure)) {
    setReportStructure(newStructure)
    toast.dismiss()
    toast.success(`成功添加资料 "${doc.name}" 到报告！`, { className: 'toast-base toast-success' })
  }
}

export const addDocumentsToReport = (
  selectedDocuments: Set<string>,
  treeNodes: DocumentNode[], // 资料库
  myUploadsNodes: DocumentNode[], // <-- 1. 添加这个新参数
  targetParentId: string | null, // 这是 "当前报告目录" 中选中的文件夹ID
  reportStructure: ReportNode[], // 这是当前的 "报告目录" 状态
  setReportStructure: (structure: ReportNode[]) => void,
  setSelectedDocuments: (documents: Set<string>) => void
) => {
  if (selectedDocuments.size === 0) {
    toast.dismiss()
    toast("请先选择要添加的资料", { className: 'toast-base toast-error' })
    return
  }

  // --- ↓↓↓ 2. 核心修复：合并两个列表 ↓↓↓ ---
  // 合并资料库和我的上传，作为所有可用文件的来源
  const allAvailableDocuments = [...treeNodes, ...myUploadsNodes];
  const getDocFromAll = (docId: string) => 
    allAvailableDocuments.find(n => n.id === docId);
  // --- ↑↑↑ 修复结束 ↑↑↑ ---

  // 3. 查找目标位置 (这部分逻辑是正确的)
  let targetChildrenList: ReportNode[]
  let parentNode: ReportNode | null = null
  const newStructure = [...reportStructure]

  if (targetParentId) {
    parentNode = getReportNode(newStructure, targetParentId)
    if (!parentNode || parentNode.type !== "folder") {
      toast.dismiss()
      toast("请选择一个报告文件夹作为目标位置", { className: 'toast-base toast-error' })
      return
    }
    // 确保 children 数组存在
    parentNode.children = parentNode.children || []
    targetChildrenList = parentNode.children
  } else {
    // 如果 targetParentId 为 null, 目标就是根目录
    targetChildrenList = newStructure
  }

  let addedCount = 0

  selectedDocuments.forEach((docId) => {
    // 4. 从合并后的列表中查找
    const doc = getDocFromAll(docId);
    
    if (!doc || doc.type !== "file") {
      console.warn(`未在任何资料库中找到 ID: ${docId}，跳过添加。`)
      return
    }

    // 5. 检查是否已存在 (在正确的目标列表中检查)
    const checkExists = (children: ReportNode[]): boolean => {
      return children.some((child) => child.sourceId === docId || (child.children && checkExists(child.children)))
    }
    
    // (这里 parentNode 可能为 null，所以我们直接用 targetChildrenList 检查)
    if (checkExists(targetChildrenList)) {
      console.warn(`资料 ${doc.name} 已存在于目标目录中，跳过。`)
      return
    }

    // 6. 创建新节点
    const newDocRef: ReportNode = {
      id: "report-doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: doc.name,
      type: "file",
      sourceId: doc.id,
      description: doc.description,
      content: doc.content,
    }

    // 7. 添加
    targetChildrenList.push(newDocRef)
    addedCount++
  })

  // 8. 更新状态
  setReportStructure(newStructure)
  setSelectedDocuments(new Set()) // 清空选择
  
  if (addedCount > 0) {
    toast.dismiss()
    toast.success(`成功添加 ${addedCount} 个资料到报告！`, { className: 'toast-base toast-success' })
  } else {
    toast.dismiss()
    toast.info("没有新的资料被添加（可能已存在）。", { className: 'toast-base toast-info' })
  }
}

export const getFolderDocuments = (
  folderId: string,
  treeNodes: DocumentNode[]
): DocumentNode[] => {
  const folder = getNode(treeNodes, folderId)
  if (!folder || folder.type !== "folder") {
    return []
  }

  const documents: DocumentNode[] = []
  
  // 递归获取文件夹内的所有文档
  const traverseFolder = (nodeId: string) => {
    const node = getNode(treeNodes, nodeId)
    if (!node) return
    
    if (node.type === "file") {
      documents.push(node)
    } else if (node.type === "folder" && node.children) {
      node.children.forEach(childId => traverseFolder(childId))
    }
  }

  if (folder.children) {
    folder.children.forEach(childId => traverseFolder(childId))
  }

  return documents
}

export const addFolderDocumentsToReport = (
  folderId: string,
  treeNodes: DocumentNode[],
  targetParentId: string | null,
  reportStructure: ReportNode[],
  setReportStructure: (structure: ReportNode[]) => void
) => {
  const folder = getNode(treeNodes, folderId)
  if (!folder || folder.type !== "folder") {
    toast.dismiss()
    toast("请选择一个文件夹", { className: 'toast-base toast-error' })
    return
  }

  const folderDocuments = getFolderDocuments(folderId, treeNodes)
  
  if (folderDocuments.length === 0) {
    toast.dismiss()
    toast("该文件夹中没有文档", { className: 'toast-base toast-info' })
    return
  }

  // 1. 查找目标父节点
  let targetChildrenList: ReportNode[]
  let parentNode: ReportNode | null = null
  const newStructure = [...reportStructure]

  if (targetParentId) {
    parentNode = getReportNode(newStructure, targetParentId)
    if (!parentNode || parentNode.type !== "folder") {
      toast.dismiss()
      toast("请选择一个报告文件夹作为目标位置", { className: 'toast-base toast-error' })
      return
    }
    // 确保 children 数组存在
    parentNode.children = parentNode.children || []
    targetChildrenList = parentNode.children
  } else {
    // 如果没有选中父节点，则添加到根目录
    targetChildrenList = newStructure
  }

  let addedCount = 0
  const skippedDocs: string[] = []

  // 2. 遍历文件夹内的所有文档
  folderDocuments.forEach((doc) => {
    // 3. 检查是否已存在 - 只检查当前目标目录，不检查子目录
    const checkExists = (children: ReportNode[]): boolean => {
      return children.some((child) => child.sourceId === doc.id)
    }
    if (checkExists(targetChildrenList)) {
      skippedDocs.push(doc.name)
      return
    }

    // 4. 创建新的报告节点
    const newDocRef: ReportNode = {
      id: "report-doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: doc.name,
      type: "file",
      sourceId: doc.id,
      description: doc.description,
      content: doc.content,
    }

    // 5. 添加到目标列表
    targetChildrenList.push(newDocRef)
    addedCount++
  })

  // 6. 更新状态
  setReportStructure(newStructure)
  
  if (addedCount > 0) {
    let message = `成功从文件夹 "${folder.name}" 添加 ${addedCount} 个资料到报告！`
    if (skippedDocs.length > 0) {
      message += ` 已跳过 ${skippedDocs.length} 个已存在的文档。`
    }
    toast.dismiss()
    toast.success(message, { className: 'toast-base toast-success' })
  } else {
    toast.dismiss()
    toast.info(`没有新的资料被添加。文件夹 "${folder.name}" 中的所有文档可能已存在于目标目录中。`, { className: 'toast-base toast-info' })
  }
}

export const deleteReportNode = (
  nodeId: string,
  reportStructure: ReportNode[],
  setReportStructure: (structure: ReportNode[]) => void,
  selectedReportNode: string | null,
  setSelectedReportNode: (nodeId: string | null) => void
) => {
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
    toast.dismiss()
    toast.error("目录名称不能为空", { className: 'toast-base toast-error' })
    return
  }

  // 查找当前节点名称
  let oldName = "未知目录"
  const findNodeName = (nodes: ReportNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === editingNodeId) {
        oldName = node.name
        node.name = editingNodeName.trim()
        return true
      }
      if (node.children && findNodeName(node.children)) {
        return true
      }
    }
    return false
  }

  const newStructure = [...reportStructure]
  findNodeName(newStructure)
  setReportStructure(newStructure)
  setEditingNodeId(null)
  setEditingNodeName("")
  
  // 显示成功提示
  toast.dismiss()
  toast.success(`目录名称已从"${oldName}"更新为"${editingNodeName.trim()}"`, { className: 'toast-base toast-success' })
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

export const addDocumentNodeToTree = (
  nodes: DocumentNode[],
  newNode: DocumentNode,
  parentId: string | null
): DocumentNode[] => {
  // 1. 设置新节点的 parentId
  newNode.parentId = parentId
  
  // 2. 如果没有父节点，直接添加到根部
  if (!parentId) {
    return [...nodes, newNode]
  }

  // 3. 如果有父节点，必须以不可变的方式更新父节点
  return nodes.map(node => {
    if (node.id === parentId && node.type === "folder") {
      // 找到了父节点，返回一个更新了 children 的新父节点对象
      return {
        ...node,
        children: node.children ? [...node.children, newNode.id] : [newNode.id]
      }
    }
    // 其他节点保持不变
    return node
  }).concat(newNode) // 4. 别忘了把新节点本身也添加到数组中
}
