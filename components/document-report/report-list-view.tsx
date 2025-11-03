"use client"

import { useState } from "react"
import { FileText, Plus, Eye, Edit2, Trash2 } from "lucide-react"
import { FlowchartLink } from "@/components/flowchart-link"

interface Report {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  structure: any[]
  styleDocFiles?: any[]
  biddingFiles?: any[]
}

interface ReportListViewProps {
  reports: Report[]
  onEditReport: (reportId: string) => void
  onDeleteReport: (reportId: string) => void
  onCreateNewReport: () => void
}

export function ReportListView({ 
  reports, 
  onEditReport, 
  onDeleteReport, 
  onCreateNewReport 
}: ReportListViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <h1 className="text-2xl font-bold">文档报告系统</h1>
        <button
          onClick={onCreateNewReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          新建报告
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText size={64} className="mb-4 opacity-50" />
            <p className="text-lg mb-2">暂无报告</p>
            <p className="text-sm mb-6">点击上方"新建报告"按钮创建您的第一个报告</p>
            <button
              onClick={onCreateNewReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              新建报告
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-medium truncate">{report.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditReport(report.id)}
                      className="p-1 text-gray-500 hover:text-blue-600 rounded"
                      title="编辑"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteReport(report.id)}
                      className="p-1 text-gray-500 hover:text-red-600 rounded"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>创建时间: {new Date(report.createdAt).toLocaleDateString()}</p>
                  <p>更新时间: {new Date(report.updatedAt).toLocaleDateString()}</p>
                  <p>目录数量: {countFolders(report.structure)}</p>
                  <p>文档数量: {countDocuments(report.structure)}</p>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    可编辑
                  </div>
                  <FlowchartLink

                    href={`/flowchart?reportId=${report.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Eye size={14} />
                    查看流程图
                  </FlowchartLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 辅助函数：计算文件夹数量
function countFolders(nodes: any[]): number {
  let count = 0
  nodes.forEach((node) => {
    if (node.type === "folder") {
      count++
      if (node.children) {
        count += countFolders(node.children)
      }
    }
  })
  return count
}

// 辅助函数：计算文档数量
function countDocuments(nodes: any[]): number {
  let count = 0
  nodes.forEach((node) => {
    if (node.type === "file") {
      count++
    } else if (node.children) {
      count += countDocuments(node.children)
    }
  })
  return count
}