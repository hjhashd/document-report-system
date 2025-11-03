"use client"

import { X } from "lucide-react"

interface CreateLibraryDirectoryModalProps {
  isOpen: boolean
  onClose: () => void
  directoryName: string
  setDirectoryName: (name: string) => void
  onCreateDirectory: () => void
}

export function CreateLibraryDirectoryModal({
  isOpen,
  onClose,
  directoryName,
  setDirectoryName,
  onCreateDirectory,
}: CreateLibraryDirectoryModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">新建资料目录</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">目录名称</label>
          <input
            type="text"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            placeholder="例如：技术文档"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            取消
          </button>
          <button
            onClick={onCreateDirectory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}