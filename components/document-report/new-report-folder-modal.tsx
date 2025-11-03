"use client"

import { X } from "lucide-react"

type NewReportFolderModalProps = {
  isOpen: boolean
  onClose: () => void
  folderName: string
  setFolderName: (name: string) => void
  parentFolder: string | null
  onCreateFolder: () => void
  getReportNodePath: (nodeId: string | null) => string
}

export function NewReportFolderModal({
  isOpen,
  onClose,
  folderName,
  setFolderName,
  parentFolder,
  onCreateFolder,
  getReportNodePath,
}: NewReportFolderModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">新建报告目录</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">目录名称</label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="例如：第一章 概述"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {parentFolder && (
            <p className="text-xs text-gray-500 mt-1">父目录: {getReportNodePath(parentFolder)}</p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            取消
          </button>
          <button
            onClick={onCreateFolder}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}