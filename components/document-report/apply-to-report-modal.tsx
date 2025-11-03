"use client"

import { X } from "lucide-react"

interface ApplyToReportModalProps {
  isOpen: boolean
  onClose: () => void
  applyType: "single" | "batch"
  directoryName: string
  setDirectoryName: (name: string) => void
  selectedDirectory: string | null
  setSelectedDirectory: (id: string | null) => void
  reportFolders: any[]
  onConfirm: () => void
}

export function ApplyToReportModal({
  isOpen,
  onClose,
  applyType,
  directoryName,
  setDirectoryName,
  selectedDirectory,
  setSelectedDirectory,
  reportFolders,
  onConfirm,
}: ApplyToReportModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {applyType === "single" ? "应用目录到报告" : "批量应用目录到报告"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {applyType === "single" ? "目录名称" : "目录前缀"}
          </label>
          <input
            type="text"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            placeholder={applyType === "single" ? "例如：第一章" : "例如：第"}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">目标位置</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="targetLocation"
                checked={selectedDirectory === null}
                onChange={() => setSelectedDirectory(null)}
                className="mr-2"
              />
              根目录
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="targetLocation"
                checked={selectedDirectory !== null}
                onChange={() => setSelectedDirectory("")}
                className="mr-2"
              />
              父目录
            </label>
            {selectedDirectory !== null && (
              <select
                value={selectedDirectory}
                onChange={(e) => setSelectedDirectory(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">请选择父目录</option>
                {reportFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}