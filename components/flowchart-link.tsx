"use client"

import Link from "next/link"
import { Workflow } from "lucide-react"

export function FlowchartLink() {
  return (
    <Link
      href="/flowchart"
      className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50 flex items-center gap-2"
      title="查看系统流程图"
    >
      <Workflow size={24} />
      <span className="text-sm font-medium">流程图</span>
    </Link>
  )
}
