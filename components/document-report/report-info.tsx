"use client"

import { useState } from "react"
import {
  FileText,
  Upload,
  X,
  HelpCircle,
  Download,
  ArrowLeft,
} from "lucide-react"
import { UploadedFile } from "./types"
import { formatFileSize } from "./report-operations"
import { TipsModal } from "./tips-modal"

interface ReportInfoProps {
  reportName: string
  setReportName: (name: string) => void
  styleDocFiles: UploadedFile[]
  biddingFiles: UploadedFile[]
  onStyleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBiddingFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveStyleFile: (fileId: string) => void
  onRemoveBiddingFile: (fileId: string) => void
  onGenerateReport: () => void
  onBackToList: () => void
  currentView: string
}

export function ReportInfo({
  reportName,
  setReportName,
  styleDocFiles,
  biddingFiles,
  onStyleFileUpload,
  onBiddingFileUpload,
  onRemoveStyleFile,
  onRemoveBiddingFile,
  onGenerateReport,
  onBackToList,
  currentView,
}: ReportInfoProps) {
  const [showTips, setShowTips] = useState(false)

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">报告信息</h2>
        <button
          onClick={() => setShowTips(true)}
          className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
          title="操作提示"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            报告名称
          </label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="请输入报告名称"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            样式说明文档
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
            <div className="flex items-center justify-center mb-4">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                  <Upload size={16} />
                  <span>上传文件</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".doc,.docx,.pdf,.txt,.xls,.xlsx"
                  onChange={onStyleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              支持 DOC, DOCX, PDF, TXT, XLS, XLSX 格式
            </div>
            {styleDocFiles.length > 0 && (
              <div className="space-y-2">
                {styleDocFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-500" />
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveStyleFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            投标需求文件
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
            <div className="flex items-center justify-center mb-4">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                  <Upload size={16} />
                  <span>上传文件</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".doc,.docx,.pdf,.txt,.xls,.xlsx"
                  onChange={onBiddingFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              支持 DOC, DOCX, PDF, TXT, XLS, XLSX 格式
            </div>
            {biddingFiles.length > 0 && (
              <div className="space-y-2">
                {biddingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-500" />
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveBiddingFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onGenerateReport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            生成报告
          </button>
          {currentView === "reportCreation" && (
            <button
              onClick={onBackToList}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              返回列表
            </button>
          )}
        </div>
      </div>

      <TipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  )
}