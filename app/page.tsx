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
import { FlowchartLink } from "@/components/flowchart-link"

export default function DocumentReportSystem() {
  const [currentView, setCurrentView] = useState("reportList")
  const [reports, setReports] = useState([])
  const [currentReportId, setCurrentReportId] = useState(null)

  const [styleDocFiles, setStyleDocFiles] = useState([])
  const [biddingFiles, setBiddingFiles] = useState([])

  const [treeNodes] = useState([
    {
      id: "1",
      name: "技术文档",
      type: "folder",
      parentId: null,
      children: ["3", "4", "6"],
    },
    {
      id: "2",
      name: "市场分析",
      type: "folder",
      parentId: null,
      children: ["5"],
    },
    {
      id: "3",
      name: "产品技术规格.pdf",
      type: "file",
      parentId: "1",
      uploadDate: "2025-10-20",
      description: "产品技术详细说明",
      content:
        "# 产品技术规格文档\n\n## 1. 产品概述\n本文档详细描述了产品的技术规格和性能参数。\n\n## 2. 技术参数\n- 处理器: 高性能多核处理器\n- 内存: 16GB DDR4\n- 存储: 512GB SSD\n- 网络: Wi-Fi 6, 蓝牙 5.0\n\n## 3. 性能指标\n- 响应时间: <100ms\n- 并发用户: 10000+\n- 可用性: 99.99%\n\n## 4. 安全特性\n- 数据加密\n- 身份认证\n- 访问控制\n- 审计日志",
      fileSize: 2048,
    },
    {
      id: "4",
      name: "API接口文档.docx",
      type: "file",
      parentId: "1",
      uploadDate: "2025-10-21",
      description: "RESTful API接口说明",
      content:
        "# API接口文档\n\n## 用户管理接口\n\n### 1. 获取用户列表\n- **接口**: GET /api/users\n- **参数**: page, limit\n- **返回**: 用户列表JSON\n\n### 2. 创建用户\n- **接口**: POST /api/users\n- **参数**: username, email, password\n- **返回**: 创建的用户信息\n\n### 3. 更新用户\n- **接口**: PUT /api/users/:id\n- **参数**: 需要更新的字段\n- **返回**: 更新后的用户信息\n\n### 4. 删除用户\n- **接口**: DELETE /api/users/:id\n- **返回**: 删除确认信息",
      fileSize: 3072,
    },
    {
      id: "5",
      name: "市场调研报告.docx",
      type: "file",
      parentId: "2",
      uploadDate: "2025-10-22",
      description: "2025年市场趋势分析",
      content:
        "# 2025年市场调研报告\n\n## 执行摘要\n本报告分析了2025年市场趋势和竞争格局。\n\n## 市场规模\n- 总市场规模: 500亿美元\n- 年增长率: 15%\n- 目标市场份额: 8%\n\n## 竞争分析\n### 主要竞争对手\n1. 公司A - 市场份额25%\n2. 公司B - 市场份额20%\n3. 公司C - 市场份额15%\n\n## 消费者洞察\n- 年龄分布: 25-45岁为主\n- 购买动机: 性价比、品牌、服务\n- 决策周期: 平均2-3个月\n\n## 市场机会\n- 新兴市场增长迅速\n- 线上渠道潜力巨大\n- 定制化需求增加",
      fileSize: 4096,
    },
    {
      id: "6",
      name: "开发规范",
      type: "folder",
      parentId: "1",
      children: ["7", "8"],
    },
    {
      id: "7",
      name: "代码规范.md",
      type: "file",
      parentId: "6",
      uploadDate: "2025-10-18",
      description: "团队代码编写规范",
      content:
        "# 代码规范\n\n## 命名规范\n- 变量名使用小驼峰: myVariable\n- 常量使用大写下划线: MAX_COUNT\n- 类名使用大驼峰: MyClass\n\n## 代码格式\n- 缩进: 2个空格\n- 行宽: 最多80字符\n- 分号: 必须使用\n\n## 注释规范\n- 函数必须有JSDoc注释\n- 复杂逻辑必须添加行内注释\n- 注释要清晰准确",
      fileSize: 1024,
    },
    {
      id: "8",
      name: "Git提交规范.md",
      type: "file",
      parentId: "6",
      uploadDate: "2025-10-19",
      description: "Git commit message规范",
      content:
        "# Git提交规范\n\n## Commit Message格式\n\n```\n<type>(<scope>): <subject>\n<body>\n<footer>\n```\n\n## Type类型\n- feat: 新功能\n- fix: 修复bug\n- docs: 文档更新\n- style: 代码格式调整\n- refactor: 重构\n- test: 测试相关\n- chore: 构建工具或辅助工具变动\n\n## 示例\n```\nfeat(user): 添加用户登录功能\n\n实现了用户登录接口和前端登录页面\n```",
      fileSize: 1536,
    },
  ])

  const [directoryLibrary, setDirectoryLibrary] = useState([
    {
      id: "dir-1",
      name: "第一章 概述",
      type: "folder",
      children: [
        { id: "dir-1-1", name: "1.1 项目背景", type: "folder", children: [] },
        { id: "dir-1-2", name: "1.2 目标与范围", type: "folder", children: [] },
      ],
    },
    {
      id: "dir-2",
      name: "第二章 技术方案",
      type: "folder",
      children: [
        { id: "dir-2-1", name: "2.1 技术架构", type: "folder", children: [] },
        { id: "dir-2-2", name: "2.2 接口设计", type: "folder", children: [] },
      ],
    },
    {
      id: "dir-3",
      name: "第三章 实施计划",
      type: "folder",
      children: [],
    },
  ])

  const [reportStructure, setReportStructure] = useState([])
  const [reportName, setReportName] = useState("")
  const [selectedReportNode, setSelectedReportNode] = useState(null)

  const [activeTab, setActiveTab] = useState("library")
  const [selectedNode, setSelectedNode] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set(["1", "2"]))
  const [expandedReportNodes, setExpandedReportNodes] = useState(new Set())
  const [expandedLibraryNodes, setExpandedLibraryNodes] = useState(new Set())

  const [selectedDirectories, setSelectedDirectories] = useState(new Set())
  const [selectedDocuments, setSelectedDocuments] = useState(new Set())

  const [showApplySingleModal, setShowApplySingleModal] = useState(false)
  const [showApplyBatchModal, setShowApplyBatchModal] = useState(false)
  const [applyTarget, setApplyTarget] = useState("root")
  const [applyParentId, setApplyParentId] = useState(null)
  const [pendingSingleDirectory, setPendingSingleDirectory] = useState(null)
  const [rootDirectoryName, setRootDirectoryName] = useState("")

  const [showNewReportFolderModal, setShowNewReportFolderModal] = useState(false)
  const [newReportFolderName, setNewReportFolderName] = useState("")
  const [newReportFolderParent, setNewReportFolderParent] = useState(null)

  const [showNewLibraryDirModal, setShowNewLibraryDirModal] = useState(false)
  const [newLibraryDirName, setNewLibraryDirName] = useState("")

  const [draggedNode, setDraggedNode] = useState(null)
  const [dragOverNode, setDragOverNode] = useState(null)

  const [editingNodeId, setEditingNodeId] = useState(null)
  const [editingNodeName, setEditingNodeName] = useState("")

  const [documentSearchQuery, setDocumentSearchQuery] = useState("")

  const [showTipsModal, setShowTipsModal] = useState(false)

  const createNewReport = () => {
    setReportName("")
    setReportStructure([])
    setSelectedReportNode(null)
    setStyleDocFiles([])
    setBiddingFiles([])
    setCurrentReportId(null)
    setCurrentView("reportCreation")
  }

  const saveReport = () => {
    if (!reportName.trim()) {
      alert("请输入报告名称")
      return
    }

    if (reportStructure.length === 0) {
      alert("请至少创建一个报告目录")
      return
    }

    const reportData = {
      id: currentReportId || "report-" + Date.now(),
      name: reportName,
      structure: reportStructure,
      styleDocFiles: styleDocFiles,
      biddingFiles: biddingFiles,
      createdAt: currentReportId ? reports.find((r) => r.id === currentReportId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (currentReportId) {
      setReports(reports.map((r) => (r.id === currentReportId ? reportData : r)))
    } else {
      setReports([...reports, reportData])
    }

    alert("报告已保存！")
    setCurrentView("reportList")
  }

  const editReport = (reportId) => {
    const report = reports.find((r) => r.id === reportId)
    if (!report) return

    setCurrentReportId(reportId)
    setReportName(report.name)
    setReportStructure(report.structure)
    setStyleDocFiles(report.styleDocFiles || [])
    setBiddingFiles(report.biddingFiles || [])
    setCurrentView("reportCreation")
  }

  const deleteReport = (reportId) => {
    if (!window.confirm("确定要删除此报告吗？")) return
    setReports(reports.filter((r) => r.id !== reportId))
  }

  const handleFileUpload = (e, fileType) => {
    const files = Array.from(e.target.files)
    const fileData = files.map((file) => ({
      id: "file-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
    }))

    if (fileType === "style") {
      setStyleDocFiles([...styleDocFiles, ...fileData])
    } else if (fileType === "bidding") {
      setBiddingFiles([...biddingFiles, ...fileData])
    }
  }

  const removeUploadedFile = (fileId, fileType) => {
    if (fileType === "style") {
      setStyleDocFiles(styleDocFiles.filter((f) => f.id !== fileId))
    } else if (fileType === "bidding") {
      setBiddingFiles(biddingFiles.filter((f) => f.id !== fileId))
    }
  }

  const getNode = (id) => treeNodes.find((n) => n.id === id)
  const getReportNode = (id) => {
    const findNode = (nodes) => {
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

  const getReportFolders = () => {
    const folders = []
    const traverse = (nodes) => {
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

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const toggleReportNode = (nodeId) => {
    const newExpanded = new Set(expandedReportNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedReportNodes(newExpanded)
  }

  const toggleLibraryNode = (nodeId) => {
    const newExpanded = new Set(expandedLibraryNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedLibraryNodes(newExpanded)
  }

  const toggleDirectorySelection = (dirId) => {
    const newSelected = new Set(selectedDirectories)
    if (newSelected.has(dirId)) {
      newSelected.delete(dirId)
    } else {
      newSelected.add(dirId)
    }
    setSelectedDirectories(newSelected)
  }

  const filterDocuments = (nodes) => {
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

  const toggleDocumentSelection = (docId) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(docId)) {
      newSelected.delete(docId)
    } else {
      newSelected.add(docId)
    }
    setSelectedDocuments(newSelected)
  }

  const deepCopyStructure = (node) => {
    const newNode = {
      ...node,
      id: "report-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      children: node.children ? node.children.map((child) => deepCopyStructure(child)) : [],
    }
    return newNode
  }

  const applySingleDirectory = (directory) => {
    setPendingSingleDirectory(directory)
    setApplyTarget("root")
    setApplyParentId(null)
    setRootDirectoryName(directory.name)
    setShowApplySingleModal(true)
  }

  const confirmSingleApply = () => {
    if (!pendingSingleDirectory) return

    if (applyTarget === "root") {
      if (!rootDirectoryName.trim()) {
        alert("请输入根目录名称")
        return
      }
      const newDir = deepCopyStructure(pendingSingleDirectory)
      newDir.name = rootDirectoryName.trim()
      setReportStructure([...reportStructure, newDir])
      setExpandedReportNodes(new Set([...expandedReportNodes, newDir.id]))
    } else if (applyTarget === "parent" && applyParentId) {
      const newDir = deepCopyStructure(pendingSingleDirectory)
      const addToParent = (nodes) => {
        for (const node of nodes) {
          if (node.id === applyParentId) {
            node.children.push(newDir)
            return true
          }
          if (node.children && addToParent(node.children)) {
            return true
          }
        }
        return false
      }
      const newStructure = [...reportStructure]
      addToParent(newStructure)
      setReportStructure(newStructure)
      setExpandedReportNodes(new Set([...expandedReportNodes, newDir.id, applyParentId]))
    }

    setShowApplySingleModal(false)
    setPendingSingleDirectory(null)
    setRootDirectoryName("")
  }

  const applySelectedDirectories = () => {
    if (selectedDirectories.size === 0) return
    setApplyTarget("root")
    setApplyParentId(null)
    setRootDirectoryName("")
    setShowApplyBatchModal(true)
  }

  const confirmBatchApply = () => {
    if (selectedDirectories.size === 0) return

    const selectedDirs = Array.from(selectedDirectories)
      .map((id) => {
        const findDir = (nodes) => {
          for (const node of nodes) {
            if (node.id === id) return node
            if (node.children) {
              const found = findDir(node.children)
              if (found) return found
            }
          }
          return null
        }
        return findDir(directoryLibrary)
      })
      .filter(Boolean)

    if (applyTarget === "root") {
      const newDirs = selectedDirs.map((dir) => deepCopyStructure(dir))
      setReportStructure([...reportStructure, ...newDirs])
      const newExpanded = new Set(expandedReportNodes)
      newDirs.forEach((dir) => newExpanded.add(dir.id))
      setExpandedReportNodes(newExpanded)
    } else if (applyTarget === "parent" && applyParentId) {
      const newDirs = selectedDirs.map((dir) => deepCopyStructure(dir))
      const addToParent = (nodes) => {
        for (const node of nodes) {
          if (node.id === applyParentId) {
            node.children.push(...newDirs)
            return true
          }
          if (node.children && addToParent(node.children)) {
            return true
          }
        }
        return false
      }
      const newStructure = [...reportStructure]
      addToParent(newStructure)
      setReportStructure(newStructure)
      const newExpanded = new Set([...expandedReportNodes, applyParentId])
      newDirs.forEach((dir) => newExpanded.add(dir.id))
      setExpandedReportNodes(newExpanded)
    }

    setShowApplyBatchModal(false)
    setSelectedDirectories(new Set())
  }

  const createLibraryDirectory = () => {
    if (!newLibraryDirName.trim()) {
      alert("请输入目录名称")
      return
    }

    const newDir = {
      id: "dir-" + Date.now(),
      name: newLibraryDirName.trim(),
      type: "folder",
      children: [],
    }

    setDirectoryLibrary([...directoryLibrary, newDir])
    setShowNewLibraryDirModal(false)
    setNewLibraryDirName("")
  }

  const deleteLibraryDirectory = (dirId) => {
    if (!window.confirm("确定要删除此目录吗？")) return

    const removeDir = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === dirId) {
          nodes.splice(i, 1)
          return true
        }
        if (nodes[i].children && removeDir(nodes[i].children)) {
          return true
        }
      }
      return false
    }

    const newLibrary = [...directoryLibrary]
    removeDir(newLibrary)
    setDirectoryLibrary(newLibrary)

    const newSelected = new Set(selectedDirectories)
    newSelected.delete(dirId)
    setSelectedDirectories(newSelected)
  }

  const createReportFolder = () => {
    if (!newReportFolderName.trim()) {
      alert("请输入目录名称")
      return
    }

    const newFolder = {
      id: "report-" + Date.now(),
      name: newReportFolderName.trim(),
      type: "folder",
      children: [],
    }

    if (newReportFolderParent) {
      const addToParent = (nodes) => {
        for (const node of nodes) {
          if (node.id === newReportFolderParent) {
            node.children.push(newFolder)
            return true
          }
          if (node.children && addToParent(node.children)) {
            return true
          }
        }
        return false
      }
      const newStructure = [...reportStructure]
      addToParent(newStructure)
      setReportStructure(newStructure)
    } else {
      setReportStructure([...reportStructure, newFolder])
    }

    setExpandedReportNodes(new Set([...expandedReportNodes, newFolder.id]))
    setShowNewReportFolderModal(false)
    setNewReportFolderName("")
    setNewReportFolderParent(null)
  }

  const addDocumentToReport = (docId) => {
    const doc = getNode(docId)
    if (!doc || doc.type !== "file") {
      alert("请选择一个资料文件")
      return
    }

    if (!selectedReportNode) {
      alert("请先选择报告目录位置")
      return
    }

    const reportNode = getReportNode(selectedReportNode)
    if (!reportNode || reportNode.type !== "folder") {
      alert("请选择一个报告目录")
      return
    }

    const checkExists = (children) => {
      return children.some((child) => child.sourceId === docId || (child.children && checkExists(child.children)))
    }

    if (checkExists(reportNode.children)) {
      alert("该资料已添加到此目录或其子目录中")
      return
    }

    const newDocRef = {
      id: "report-doc-" + Date.now(),
      name: doc.name,
      type: "file",
      sourceId: docId,
      description: doc.description,
      content: doc.content,
    }

    const addToNode = (nodes) => {
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

  const addDocumentsToReport = () => {
    if (selectedDocuments.size === 0) {
      alert("请先选择要添加的资料")
      return
    }
    if (!selectedReportNode) {
      alert("请先选择报告中的目标目录")
      return
    }

    const reportNode = getReportNode(selectedReportNode)
    if (!reportNode || reportNode.type !== "folder") {
      alert("请选择一个报告文件夹")
      return
    }

    const newStructure = [...reportStructure]
    let addedCount = 0

    selectedDocuments.forEach((docId) => {
      const doc = getNode(docId)
      if (!doc || doc.type !== "file") return

      const checkExists = (children) => {
        return children.some((child) => child.sourceId === docId || (child.children && checkExists(child.children)))
      }

      if (checkExists(reportNode.children)) {
        console.warn(`Document ${doc.name} already exists in the selected report folder.`)
        return
      }

      const newDocRef = {
        id: "report-doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        name: doc.name,
        type: "file",
        sourceId: docId,
        description: doc.description,
        content: doc.content,
      }

      const addToNode = (nodes) => {
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

  const deleteReportNode = (nodeId) => {
    if (!window.confirm("确定要删除此项吗？")) return

    const removeNode = (nodes) => {
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

  const startEditingNode = (nodeId, currentName) => {
    setEditingNodeId(nodeId)
    setEditingNodeName(currentName)
  }

  const saveEditedNodeName = () => {
    if (!editingNodeName.trim()) {
      alert("目录名称不能为空")
      return
    }

    const updateNodeName = (nodes) => {
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

  const cancelEditing = () => {
    setEditingNodeId(null)
    setEditingNodeName("")
  }

  const handleDragStart = (e, node) => {
    setDraggedNode(node)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, node) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (node.type === "folder" && node.id !== draggedNode?.id) {
      setDragOverNode(node.id)
    }
  }

  const handleDragLeave = () => {
    setDragOverNode(null)
  }

  const handleDrop = (e, targetNode) => {
    e.preventDefault()
    setDragOverNode(null)

    if (!draggedNode || draggedNode.id === targetNode.id) return

    const removeNode = (nodes) => {
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

    const addToTarget = (nodes) => {
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
    setDraggedNode(null)

    setExpandedReportNodes(new Set([...expandedReportNodes, targetNode.id]))
  }

  const generateReport = () => {
    if (!reportName.trim()) {
      alert("请输入报告名称")
      return
    }

    if (reportStructure.length === 0) {
      alert("请至少创建一个报告目录")
      return
    }

    const hasDocuments = (nodes) => {
      for (const node of nodes) {
        if (node.type === "file") return true
        if (node.children && hasDocuments(node.children)) return true
      }
      return false
    }

    if (!hasDocuments(reportStructure)) {
      alert("请至少添加一个资料")
      return
    }

    let reportContent = `# ${reportName}\n\n生成日期: ${new Date().toLocaleDateString()}\n\n---\n\n`

    const generateSection = (nodes, level = 1) => {
      let content = ""
      nodes.forEach((node) => {
        if (node.type === "folder") {
          content += `\n${"#".repeat(level + 1)} ${node.name}\n\n`
          if (node.children) {
            content += generateSection(node.children, level + 1)
          }
        } else if (node.type === "file") {
          content += `\n${"#".repeat(level + 1)} ${node.name}\n\n`
          if (node.description) {
            content += `> ${node.description}\n\n`
          }
          if (node.content) {
            content += `${node.content}\n\n`
          }
        }
      })
      return content
    }

    reportContent += generateSection(reportStructure)

    const element = document.createElement("a")
    const file = new Blob([reportContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${reportName}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    alert("报告已生成并下载！")
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const renderTree = (parentId = null, level = 0) => {
    const children = treeNodes.filter((n) => n.parentId === parentId)
    const filteredChildren = filterDocuments(children)

    return filteredChildren.map((node) => {
      const isExpanded = expandedNodes.has(node.id)
      const isSelected = selectedNode === node.id
      const isChecked = selectedDocuments.has(node.id)
      const hasChildren = node.type === "folder" && node.children && node.children.length > 0

      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              isSelected ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
            style={{ marginLeft: `${level * 20}px` }}
          >
            {node.type === "file" && (
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleDocumentSelection(node.id)}
                className="flex-shrink-0 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {node.type === "folder" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNode(node.id)
                }}
                className="p-0 flex-shrink-0"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              node.type !== "file" && <span className="w-4 flex-shrink-0" />
            )}

            <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => setSelectedNode(node.id)}>
              {node.type === "folder" ? (
                <Folder size={18} className="text-yellow-600 flex-shrink-0" />
              ) : (
                <File size={18} className="text-blue-600 flex-shrink-0" />
              )}

              <span className="flex-1 text-sm truncate">{node.name}</span>
            </div>
          </div>

          {node.type === "folder" && isExpanded && hasChildren && renderTree(node.id, level + 1)}
        </div>
      )
    })
  }

  const getNodePath = (nodeId) => {
    const path = []
    let currentId = nodeId

    while (currentId) {
      const node = getNode(currentId)
      if (!node) break
      path.unshift(node.name)
      currentId = node.parentId
    }

    return path.join(" / ") || "根目录"
  }

  const getReportNodePath = (nodeId) => {
    const path = []
    const findPath = (nodes, targetId, currentPath) => {
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

  const renderLibraryTree = (nodes, level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedLibraryNodes.has(node.id)
      const isSelected = selectedDirectories.has(node.id)
      const hasChildren = node.type === "folder" && node.children && node.children.length > 0

      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              isSelected ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100"
            }`}
            style={{ marginLeft: `${level * 20}px` }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleDirectorySelection(node.id)}
              className="flex-shrink-0 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />

            {node.type === "folder" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLibraryNode(node.id)
                }}
                className="p-0 flex-shrink-0"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-4 flex-shrink-0" />
            )}

            <div
              className="flex items-center gap-2 flex-1 cursor-pointer"
              onClick={() => {
                setSelectedNode(node.id)
                if (node.type === "folder") toggleLibraryNode(node.id)
              }}
            >
              {node.type === "folder" ? (
                <Folder size={18} className="text-purple-600 flex-shrink-0" />
              ) : (
                <File size={18} className="text-blue-600 flex-shrink-0" />
              )}
              <span className="flex-1 text-sm truncate">{node.name}</span>
            </div>

            {node.type === "folder" && (
              <button
                onClick={() => applySingleDirectory(node)}
                className="p-1 rounded hover:bg-gray-200"
                title="将此目录添加到报告"
              >
                <Plus size={16} className="text-gray-500" />
              </button>
            )}
            <button
              onClick={() => deleteLibraryDirectory(node.id)}
              className="p-1 rounded hover:bg-red-100"
              title="删除此目录"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>

          {node.type === "folder" && isExpanded && hasChildren && renderLibraryTree(node.children, level + 1)}
        </div>
      )
    })
  }

  const renderReportTree = (nodes, level = 0) => {
    const filteredNodes = filterDocuments(nodes)
    return filteredNodes.map((node) => {
      const isExpanded = expandedReportNodes.has(node.id)
      const isSelected = selectedReportNode === node.id
      const hasChildren = node.type === "folder" && node.children && node.children.length > 0

      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              isSelected ? "bg-green-100 text-green-700" : "hover:bg-gray-100"
            }`}
            style={{ marginLeft: `${level * 20}px` }}
            onDragStart={(e) => handleDragStart(e, node)}
            onDragOver={(e) => handleDragOver(e, node)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, node)}
            draggable={node.type === "folder"}
          >
            {node.type === "folder" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleReportNode(node.id)
                }}
                className="p-0 flex-shrink-0"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-4 flex-shrink-0" />
            )}

            <div
              className={`flex items-center gap-2 flex-1 cursor-pointer ${dragOverNode === node.id ? "bg-blue-200" : ""}`}
              onClick={() => setSelectedReportNode(node.id)}
              onDoubleClick={() => startEditingNode(node.id, node.name)}
            >
              {node.type === "folder" ? (
                <Folder size={18} className="text-yellow-600 flex-shrink-0" />
              ) : (
                <File size={18} className="text-green-600 flex-shrink-0" />
              )}

              {editingNodeId === node.id ? (
                <input
                  type="text"
                  value={editingNodeName}
                  onChange={(e) => setEditingNodeName(e.target.value)}
                  onBlur={saveEditedNodeName}
                  onKeyPress={(e) => e.key === "Enter" && saveEditedNodeName()}
                  autoFocus
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
              ) : (
                <span className="flex-1 text-sm truncate">{node.name}</span>
              )}
            </div>

            {!editingNodeId && (
              <>
                <button
                  onClick={() => startEditingNode(node.id, node.name)}
                  className="p-1 rounded hover:bg-gray-200"
                  title="重命名"
                >
                  <Edit2 size={16} className="text-gray-500" />
                </button>
                <button onClick={() => deleteReportNode(node.id)} className="p-1 rounded hover:bg-red-100" title="删除">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </>
            )}
          </div>

          {node.type === "folder" && isExpanded && hasChildren && renderReportTree(node.children, level + 1)}
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-800">文档报告系统</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("library")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "library" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={20} />
                  资料库
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab("report")
                  setCurrentView("reportList")
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "report" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={20} />
                  报告生成
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab === "library" ? (
          <div className="flex gap-6 h-[calc(100vh-140px)]">
            <div className="w-80 bg-white rounded-lg shadow p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">资料目录</h2>
              </div>

              <div className="group mb-2">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                    selectedNode === null ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedNode(null)}
                >
                  <FolderOpen size={18} className="text-blue-600" />
                  <span className="flex-1 text-sm font-medium">根目录</span>
                </div>
              </div>

              <div className="space-y-1">{renderTree()}</div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto">
              {selectedNode ? (
                (() => {
                  const node = getNode(selectedNode)
                  if (!node) return null

                  return (
                    <div>
                      <div className="border-b pb-4 mb-4">
                        <div className="flex items-start gap-3">
                          {node.type === "folder" ? (
                            <Folder size={32} className="text-yellow-600 mt-1 flex-shrink-0" />
                          ) : (
                            <File size={32} className="text-blue-600 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold mb-2 break-words">{node.name}</h2>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">类型:</span>
                                <span>{node.type === "folder" ? "文件夹" : "文件"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">路径:</span>
                                <span className="break-words">{getNodePath(selectedNode)}</span>
                              </div>
                              {node.type === "file" && (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">上传日期:</span>
                                    <span>{node.uploadDate}</span>
                                  </div>
                                  {node.fileSize && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">文件大小:</span>
                                      <span>{formatFileSize(node.fileSize)}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {node.type === "file" && node.description && (
                        <div className="mb-6">
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <FileText size={18} />
                            资料描述
                          </h3>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{node.description}</p>
                        </div>
                      )}

                      {node.type === "file" && node.content && (
                        <div className="mb-6">
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Eye size={18} />
                            内容预览
                          </h3>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-[500px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap break-words">{node.content}</pre>
                          </div>
                        </div>
                      )}

                      {node.type === "folder" && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Folder size={18} />
                            包含内容 ({node.children ? node.children.length : 0} 项)
                          </h3>
                          <div className="space-y-2">
                            {node.children && node.children.length > 0 ? (
                              node.children.map((childId) => {
                                const child = getNode(childId)
                                if (!child) return null
                                return (
                                  <div
                                    key={childId}
                                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => {
                                      setSelectedNode(childId)
                                      if (child.type === "folder") {
                                        setExpandedNodes(new Set([...expandedNodes, childId]))
                                      }
                                    }}
                                  >
                                    {child.type === "folder" ? (
                                      <Folder size={24} className="text-yellow-600 flex-shrink-0" />
                                    ) : (
                                      <File size={24} className="text-blue-600 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-base truncate">{child.name}</div>
                                      {child.type === "file" && child.description && (
                                        <div className="text-sm text-gray-500 truncate mt-1">{child.description}</div>
                                      )}
                                      {child.type === "folder" && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          {child.children ? child.children.length : 0} 项内容
                                        </div>
                                      )}
                                    </div>
                                    <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                                  </div>
                                )
                              })
                            ) : (
                              <div className="text-center py-12 text-gray-400">
                                <Folder size={48} className="mx-auto mb-2 opacity-50" />
                                <p>此文件夹为空</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FolderOpen size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">欢迎使用资料管理系统</p>
                    <p className="text-sm">请从左侧选择一个目录或文件</p>
                    <p className="text-sm mt-1">查看详细信息和内容</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : currentView === "reportList" ? (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">报告列表</h2>
              <button
                onClick={createNewReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                新增报告
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2 text-gray-600">暂无报告</h3>
                <p className="text-gray-500 mb-6">点击"新增报告"按钮创建您的第一个报告</p>
                <button
                  onClick={createNewReport}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  新增报告
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileText size={32} className="text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-lg truncate">{report.name}</h3>
                          <p className="text-sm text-gray-500">{new Date(report.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Folder size={16} />
                        <span>{report.structure.length} 个目录</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Upload size={16} />
                        <span>{(report.styleDocFiles?.length || 0) + (report.biddingFiles?.length || 0)} 个附件</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => editReport(report.id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Edit2 size={16} />
                        编辑
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentView("reportList")}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                返回列表
              </button>
              <button
                onClick={saveReport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={20} />
                保存报告
              </button>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[calc(100%-60px)]">
              <div className="col-span-3 flex flex-col gap-4">
                <div className="bg-white rounded-lg shadow p-4 h-[45%] overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">报告目录库</h2>
                    <button
                      onClick={() => setShowNewLibraryDirModal(true)}
                      className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700"
                      title="新增目录"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {selectedDirectories.size > 0 && (
                    <button
                      onClick={applySelectedDirectories}
                      className="w-full mb-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                    >
                      <Copy size={16} />
                      应用选中 ({selectedDirectories.size})
                    </button>
                  )}

                  {directoryLibrary.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Folder size={40} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">暂无目录</p>
                    </div>
                  ) : (
                    <div className="space-y-1">{renderLibraryTree(directoryLibrary)}</div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow p-4 h-[55%] overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">当前报告目录</h2>
                    <button
                      onClick={() => {
                        setNewReportFolderParent(selectedReportNode)
                        setShowNewReportFolderModal(true)
                      }}
                      className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                      title="新建目录"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {reportStructure.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Folder size={40} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs mb-2">暂无报告目录</p>
                      <button
                        onClick={() => setShowNewReportFolderModal(true)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                      >
                        创建目录
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">{renderReportTree(reportStructure)}</div>
                  )}

                  {selectedReportNode && (
                    <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-xs text-green-700 font-medium mb-1">当前选中:</div>
                      <div className="text-xs text-green-900 truncate">{getReportNodePath(selectedReportNode)}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-4 bg-white rounded-lg shadow p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">选择资料</h2>

                <div className="mb-4">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={documentSearchQuery}
                      onChange={(e) => setDocumentSearchQuery(e.target.value)}
                      placeholder="搜索资料名称、描述或内容..."
                      className="w-full pl-10 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  {documentSearchQuery && (
                    <div className="mt-2 text-xs text-gray-500">搜索: &quot;{documentSearchQuery}&quot;</div>
                  )}
                </div>

                {selectedDocuments.size > 0 && (
                  <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                    已选择 {selectedDocuments.size} 个资料
                  </div>
                )}

                <div className="space-y-1">{renderTree()}</div>

                {selectedDocuments.size > 0 && (
                  <div className="mt-4 sticky bottom-0 bg-white pt-4 border-t">
                    <button
                      onClick={addDocumentsToReport}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRight size={20} />
                      添加 {selectedDocuments.size} 个资料到报告
                    </button>
                  </div>
                )}
              </div>

              <div className="col-span-5 bg-white rounded-lg shadow p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">报告信息</h2>
                  <button
                    onClick={() => setShowTipsModal(true)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="查看操作提示"
                  >
                    <HelpCircle size={20} className="text-blue-600" />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">报告名称</label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="输入报告名称"
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="mb-6 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">样式说明文档</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e, "style")}
                        className="hidden"
                        id="style-upload"
                        accept=".doc,.docx,.pdf,.txt"
                      />
                      <label
                        htmlFor="style-upload"
                        className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-blue-600"
                      >
                        <Upload size={28} className="mb-2" />
                        <span className="text-xs text-center">点击上传或拖拽文件</span>
                        <span className="text-xs text-gray-400 mt-1 text-center">DOC, DOCX, PDF, TXT</span>
                      </label>
                    </div>

                    {styleDocFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {styleDocFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <File size={14} className="text-blue-600 flex-shrink-0" />
                              <span className="text-xs truncate">{file.name}</span>
                            </div>
                            <button
                              onClick={() => removeUploadedFile(file.id, "style")}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <X size={14} className="text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">投标需求文件</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e, "bidding")}
                        className="hidden"
                        id="bidding-upload"
                        accept=".doc,.docx,.pdf,.txt,.xls,.xlsx"
                      />
                      <label
                        htmlFor="bidding-upload"
                        className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-blue-600"
                      >
                        <Upload size={28} className="mb-2" />
                        <span className="text-xs text-center">点击上传或拖拽文件</span>
                        <span className="text-xs text-gray-400 mt-1 text-center">DOC, PDF, XLS, XLSX</span>
                      </label>
                    </div>

                    {biddingFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {biddingFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <File size={14} className="text-blue-600 flex-shrink-0" />
                              <span className="text-xs truncate">{file.name}</span>
                            </div>
                            <button
                              onClick={() => removeUploadedFile(file.id, "bidding")}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <X size={14} className="text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">报告结构预览</h3>
                  <div className="border rounded-lg p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                    {reportStructure.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Folder size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无报告结构</p>
                        <p className="text-xs mt-1">请从左侧创建或应用目录</p>
                      </div>
                    ) : (
                      <div className="space-y-1">{renderReportTree(reportStructure)}</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => setCurrentView("reportList")}
                    className="px-5 py-2 border rounded hover:bg-gray-100 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={generateReport}
                    className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={20} />
                    生成报告
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showNewReportFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新建报告目录</h3>
              <button onClick={() => setShowNewReportFolderModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">目录名称</label>
              <input
                type="text"
                value={newReportFolderName}
                onChange={(e) => setNewReportFolderName(e.target.value)}
                placeholder="例如：第一章 概述"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {newReportFolderParent && (
                <p className="text-xs text-gray-500 mt-1">父目录: {getReportNodePath(newReportFolderParent)}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewReportFolderModal(false)}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={createReportFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewLibraryDirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新建资料库目录</h3>
              <button onClick={() => setShowNewLibraryDirModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">目录名称</label>
              <input
                type="text"
                value={newLibraryDirName}
                onChange={(e) => setNewLibraryDirName(e.target.value)}
                placeholder="例如：基础信息"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewLibraryDirModal(false)}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={createLibraryDirectory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {showApplySingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">应用目录到报告</h3>
              <button onClick={() => setShowApplySingleModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">应用目标</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="applyTarget"
                    value="root"
                    checked={applyTarget === "root"}
                    onChange={(e) => setApplyTarget(e.target.value)}
                    className="form-radio"
                  />
                  <span className="ml-2">根目录</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="applyTarget"
                    value="parent"
                    checked={applyTarget === "parent"}
                    onChange={(e) => setApplyTarget(e.target.value)}
                    className="form-radio"
                  />
                  <span className="ml-2">指定父目录</span>
                </label>
              </div>
            </div>

            {applyTarget === "root" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">根目录名称</label>
                <input
                  type="text"
                  value={rootDirectoryName}
                  onChange={(e) => setRootDirectoryName(e.target.value)}
                  placeholder="请输入根目录名称"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {applyTarget === "parent" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">选择父目录</label>
                <select
                  value={applyParentId || ""}
                  onChange={(e) => setApplyParentId(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- 选择父目录 --</option>
                  {getReportFolders().map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {getReportNodePath(folder.id)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApplySingleModal(false)}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={confirmSingleApply}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                应用
              </button>
            </div>
          </div>
        </div>
      )}

      {showApplyBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">批量应用目录到报告</h3>
              <button onClick={() => setShowApplyBatchModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">应用目标</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="batchApplyTarget"
                    value="root"
                    checked={applyTarget === "root"}
                    onChange={(e) => setApplyTarget(e.target.value)}
                    className="form-radio"
                  />
                  <span className="ml-2">根目录</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="batchApplyTarget"
                    value="parent"
                    checked={applyTarget === "parent"}
                    onChange={(e) => setApplyTarget(e.target.value)}
                    className="form-radio"
                  />
                  <span className="ml-2">指定父目录</span>
                </label>
              </div>
            </div>

            {applyTarget === "root" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">根目录名称</label>
                <input
                  type="text"
                  value={rootDirectoryName}
                  onChange={(e) => setRootDirectoryName(e.target.value)}
                  placeholder="请输入根目录名称"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {applyTarget === "parent" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">选择父目录</label>
                <select
                  value={applyParentId || ""}
                  onChange={(e) => setApplyParentId(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- 选择父目录 --</option>
                  {getReportFolders().map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {getReportNodePath(folder.id)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApplyBatchModal(false)}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={confirmBatchApply}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                应用
              </button>
            </div>
          </div>
        </div>
      )}

      {showTipsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <HelpCircle size={24} className="text-blue-600" />
                操作提示
              </h3>
              <button onClick={() => setShowTipsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold mb-2">资料库与报告结构:</h4>
                <div>
                  <p>- 资料库 (左侧上方) 包含所有可用的文档和文件夹。</p>
                  <p>- 报告目录库 (左侧下方) 是预设的目录模板，可快速应用到报告中。</p>
                  <p>- 当前报告目录 (右侧) 显示正在编辑的报告结构。</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">报告结构调整</h4>
                <div>
                  <p>
                    -
                    拖拽左侧的&quot;报告目录库&quot;中的文件夹到右侧&quot;当前报告目录&quot;中的目标文件夹，可以快速复制整个目录结构。
                  </p>
                  <p>- 在&quot;当前报告目录&quot;中，可以右键单击文件夹进行重命名、新建子目录或删除操作。</p>
                  <p>- 双击&quot;当前报告目录&quot;中的文件夹名称，可以直接编辑其名称。</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">资料添加</h4>
                <div>
                  <p>- 在中间的&quot;选择资料&quot;区域，可以通过搜索框快速查找所需资料。</p>
                  <p>- 勾选需要添加的资料文件，然后点击下方的&quot;添加 X 个资料到报告&quot;按钮。</p>
                  <p>- 确保在&quot;当前报告目录&quot;中已选择一个目标文件夹，资料将被添加到该文件夹下。</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">文件上传</h4>
                <div>
                  <p>
                    - &quot;报告信息&quot;区域的&quot;样式说明文档&quot;和&quot;投标需求文件&quot;支持上传多个文件。
                  </p>
                  <p>- 支持常见文档格式（DOC, DOCX, PDF, TXT, XLS, XLSX）。</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">报告生成</h4>
                <div>
                  <p>- 填写&quot;报告名称&quot;，确认报告结构和附件无误后，点击&quot;生成报告&quot;按钮。</p>
                  <p>- 生成的报告将以TXT格式下载到您的本地。</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTipsModal(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      <FlowchartLink />
    </div>
  )
}
