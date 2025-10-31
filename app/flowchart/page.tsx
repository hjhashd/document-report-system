"use client"

import { ArrowRight, FileText, FolderTree, Upload, Save, Edit, Trash2, CheckSquare, Search } from "lucide-react"
import Link from "next/link"

export default function FlowchartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">文档报告系统流程图</h1>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            返回系统
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* 流程图主体 */}
          <div className="space-y-12">
            {/* 第一步：进入系统 */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg shadow-md text-center min-w-[200px]">
                <div className="text-lg font-semibold">进入报告系统</div>
                <div className="text-sm mt-1 opacity-90">查看报告列表</div>
              </div>
              <ArrowRight className="rotate-90 my-4 text-gray-400" size={32} />
            </div>

            {/* 第二步：选择操作 */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-lg shadow-md text-center min-w-[200px]">
                <div className="text-lg font-semibold">选择操作</div>
                <div className="text-sm mt-1 opacity-90">新增/编辑/删除报告</div>
              </div>
              <ArrowRight className="rotate-90 my-4 text-gray-400" size={32} />
            </div>

            {/* 第三步：三个并行操作 */}
            <div className="grid grid-cols-3 gap-6">
              {/* 左侧：报告目录库 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-md text-center w-full">
                  <FolderTree className="mx-auto mb-2" size={32} />
                  <div className="font-semibold">报告目录库</div>
                  <div className="text-sm mt-2 opacity-90">选择目录结构</div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 w-full">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckSquare size={16} className="text-green-600" />
                      <span>多选目录节点</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckSquare size={16} className="text-green-600" />
                      <span>选择应用位置</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckSquare size={16} className="text-green-600" />
                      <span>批量应用到报告</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 中间：资料库 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-lg shadow-md text-center w-full">
                  <FileText className="mx-auto mb-2" size={32} />
                  <div className="font-semibold">选择资料</div>
                  <div className="text-sm mt-2 opacity-90">从资料库选择文档</div>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 w-full">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Search size={16} className="text-orange-600" />
                      <span>搜索过滤资料</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckSquare size={16} className="text-orange-600" />
                      <span>多选资料文件</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckSquare size={16} className="text-orange-600" />
                      <span>添加到报告目录</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：文件上传 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4 rounded-lg shadow-md text-center w-full">
                  <Upload className="mx-auto mb-2" size={32} />
                  <div className="font-semibold">上传文件</div>
                  <div className="text-sm mt-2 opacity-90">上传相关文档</div>
                </div>

                <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4 w-full">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Upload size={16} className="text-pink-600" />
                      <span>样式说明文档</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Upload size={16} className="text-pink-600" />
                      <span>投标需求文件</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckSquare size={16} className="text-pink-600" />
                      <span>支持批量上传</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 汇聚箭头 */}
            <div className="flex justify-center">
              <ArrowRight className="rotate-90 text-gray-400" size={32} />
            </div>

            {/* 第四步：编辑报告结构 */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-4 rounded-lg shadow-md text-center min-w-[300px]">
                <Edit className="mx-auto mb-2" size={32} />
                <div className="text-lg font-semibold">编辑报告结构</div>
                <div className="text-sm mt-2 opacity-90">调整目录顺序和内容</div>
              </div>

              <div className="mt-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 max-w-md">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-indigo-600" />
                    <span>拖拽调整目录顺序</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit size={16} className="text-indigo-600" />
                    <span>双击修改目录名称</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} className="text-indigo-600" />
                    <span>删除不需要的节点</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FolderTree size={16} className="text-indigo-600" />
                    <span>新增子目录</span>
                  </div>
                </div>
              </div>

              <ArrowRight className="rotate-90 my-4 text-gray-400" size={32} />
            </div>

            {/* 第五步：预览和保存 */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-lg shadow-md text-center min-w-[200px]">
                <Save className="mx-auto mb-2" size={32} />
                <div className="text-lg font-semibold">预览并保存</div>
                <div className="text-sm mt-2 opacity-90">查看报告结构预览</div>
              </div>

              <div className="mt-4 bg-teal-50 border-2 border-teal-200 rounded-lg p-4 max-w-md">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-teal-600" />
                    <span>查看完整报告结构</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Save size={16} className="text-teal-600" />
                    <span>保存报告配置</span>
                  </div>
                </div>
              </div>

              <ArrowRight className="rotate-90 my-4 text-gray-400" size={32} />
            </div>

            {/* 第六步：完成 */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-lg shadow-md text-center min-w-[200px]">
                <div className="text-lg font-semibold">✓ 报告创建完成</div>
                <div className="text-sm mt-1 opacity-90">返回报告列表</div>
              </div>
            </div>
          </div>

          {/* 功能说明 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">核心功能说明</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FolderTree className="text-green-600" size={20} />
                  报告目录库管理
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-7">
                  <li>• 支持多层级目录结构</li>
                  <li>• 单选或多选目录节点</li>
                  <li>• 一键应用到报告或指定父目录</li>
                  <li>• 支持新增和删除目录模板</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="text-orange-600" size={20} />
                  资料库管理
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-7">
                  <li>• 支持多选资料文件</li>
                  <li>• 搜索过滤功能</li>
                  <li>• 批量添加到报告目录</li>
                  <li>• 树形结构展示</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Edit className="text-indigo-600" size={20} />
                  报告结构编辑
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-7">
                  <li>• 拖拽调整目录顺序</li>
                  <li>• 双击修改目录名称</li>
                  <li>• 新增/删除目录节点</li>
                  <li>• 实时预览报告结构</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Upload className="text-pink-600" size={20} />
                  文件上传
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-7">
                  <li>• 样式说明文档上传</li>
                  <li>• 投标需求文件上传</li>
                  <li>• 支持批量文件上传</li>
                  <li>• 文件预览和删除</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
