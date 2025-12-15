"use client"

import { ReportNode, DocumentNode, UploadedFile } from "./types"
import { toast } from "sonner"

export const createNewReport = (
  setReportName: (name: string) => void,
  setReportStructure: (structure: ReportNode[]) => void,
  setSelectedReportNode: (nodeId: string | null) => void,
  setStyleDocFiles: (files: UploadedFile[]) => void,
  setBiddingFiles: (files: UploadedFile[]) => void,
  setCurrentReportId: (id: string | null) => void,
  setCurrentView: (view: string) => void
) => {
  setReportName("")
  setReportStructure([])
  setSelectedReportNode(null)
  setStyleDocFiles([])
  setBiddingFiles([])
  setCurrentReportId(null)
  setCurrentView("reportCreation")
}

export const saveReport = (
  reportName: string,
  reportStructure: ReportNode[],
  styleDocFiles: UploadedFile[],
  biddingFiles: UploadedFile[],
  currentReportId: string | null,
  reports: any[],
  setReports: (reports: any[]) => void,
  setCurrentView: (view: string) => void
) => {
  if (!reportName.trim()) {
    toast.dismiss()
    toast.error("请输入报告名称", { className: 'toast-base toast-error' })
    return
  }

  if (reportStructure.length === 0) {
    toast.dismiss()
    toast.error("请至少创建一个报告目录", { className: 'toast-base toast-error' })
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

  toast.dismiss()
  toast.success("报告已保存！", { className: 'toast-base toast-success' })
  setCurrentView("reportList")
}

export const editReport = (
  reportId: string,
  reports: any[],
  setCurrentReportId: (id: string) => void,
  setReportName: (name: string) => void,
  setReportStructure: (structure: ReportNode[]) => void,
  setStyleDocFiles: (files: UploadedFile[]) => void,
  setBiddingFiles: (files: UploadedFile[]) => void,
  setCurrentView: (view: string) => void
) => {
  const report = reports.find((r) => r.id === reportId)
  if (!report) return

  setCurrentReportId(reportId)
  setReportName(report.name)
  setReportStructure(report.structure)
  setStyleDocFiles(report.styleDocFiles || [])
  setBiddingFiles(report.biddingFiles || [])
  setCurrentView("reportCreation")
  
  toast.dismiss()
  toast.info(`正在编辑报告"${report.name}"`, { className: 'toast-base toast-info' })
}

export const deleteReport = (reportId: string, reports: any[], setReports: (reports: any[]) => void) => {
  if (!window.confirm("确定要删除此报告吗？")) return
  
  // 找到要删除的报告名称，用于提示消息
  const reportToDelete = reports.find((r) => r.id === reportId)
  const reportName = reportToDelete?.name || "未知报告"
  
  setReports(reports.filter((r) => r.id !== reportId))
  
  toast.dismiss()
  toast.success(`报告"${reportName}"已删除！`, { className: 'toast-base toast-success' })
}

export const removeUploadedFile = (
  fileId: string,
  fileType: "style" | "bidding",
  styleDocFiles: UploadedFile[],
  biddingFiles: UploadedFile[],
  setStyleDocFiles: (files: UploadedFile[]) => void,
  setBiddingFiles: (files: UploadedFile[]) => void
) => {
  let fileName = ""
  
  if (fileType === "style") {
    const fileToRemove = styleDocFiles.find((f) => f.id === fileId)
    fileName = fileToRemove?.name || "未知文件"
    setStyleDocFiles(styleDocFiles.filter((f) => f.id !== fileId))
  } else if (fileType === "bidding") {
    const fileToRemove = biddingFiles.find((f) => f.id === fileId)
    fileName = fileToRemove?.name || "未知文件"
    setBiddingFiles(biddingFiles.filter((f) => f.id !== fileId))
  }
  
  toast.dismiss()
  toast.success(`文件"${fileName}"已移除！`, { className: 'toast-base toast-success' })
}

export const generateReport = (
  reportName: string,
  reportStructure: ReportNode[],
  setReportName: (name: string) => void
) => {
  if (!reportName.trim()) {
    toast.dismiss()
    toast.error("请输入报告名称", { className: 'toast-base toast-error' })
    return
  }

  if (reportStructure.length === 0) {
    toast.dismiss()
    toast.error("请至少创建一个报告目录", { className: 'toast-base toast-error' })
    return
  }

  const hasDocuments = (nodes: ReportNode[]): boolean => {
    for (const node of nodes) {
      if (node.type === "file") return true
      if (node.children && hasDocuments(node.children)) return true
    }
    return false
  }

  if (!hasDocuments(reportStructure)) {
    toast.dismiss()
    toast.error("请至少添加一个资料", { className: 'toast-base toast-error' })
    return
  }

  let reportContent = `# ${reportName}\n\n生成日期: ${new Date().toLocaleDateString()}\n\n---\n\n`

  const generateSection = (nodes: ReportNode[], level = 1): string => {
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

  toast.dismiss()
  toast.success("报告已生成并下载！", { className: 'toast-base toast-success' })
}

export const formatFileSize = (bytes: number): string => {
  if (!bytes) return "N/A"
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}
