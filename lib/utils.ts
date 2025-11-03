export function formatFileSize(bytes: number | undefined) {
  if (!bytes) return "N/A"
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}

export function deepCopyStructure(node: any) {
  const newNode = {
    ...node,
    id: "report-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    children: node.children ? node.children.map((child: any) => deepCopyStructure(child)) : [],
  }
  return newNode
}