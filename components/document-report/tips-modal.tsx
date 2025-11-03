"use client"

import { X, HelpCircle } from "lucide-react"

type TipsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function TipsModal({ isOpen, onClose }: TipsModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <HelpCircle size={24} className="text-blue-600" />
            操作提示
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  )
}