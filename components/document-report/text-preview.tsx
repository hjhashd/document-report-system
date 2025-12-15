"use client"

import { useMemo } from "react"

interface TextPreviewProps {
  text: string
  isMarkdown?: boolean
}

export function TextPreview({ text, isMarkdown = false }: TextPreviewProps) {
  const html = useMemo(() => {
    if (!isMarkdown) {
      // 纯文本：转义并保留换行
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
      return `<pre class="whitespace-pre-wrap">${escaped}</pre>`
    }
    // 简易 Markdown 处理（标题、加粗、斜体、列表、链接、代码块）
    let md = text
    // 代码块 ```
    md = md.replace(/```([\s\S]*?)```/g, (_, code) => {
      const esc = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      return `<pre class="bg-gray-100 p-3 rounded whitespace-pre-wrap">${esc}</pre>`
    })
    // 行内代码 `code`
    md = md.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
    // 粗体 **text**
    md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 斜体 *text*
    md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // 标题 #, ##, ###
    md = md.replace(/^###\s+(.*)$/gm, '<h3 class="text-lg font-semibold mt-4">$1</h3>')
    md = md.replace(/^##\s+(.*)$/gm, '<h2 class="text-xl font-bold mt-6">$1</h2>')
    md = md.replace(/^#\s+(.*)$/gm, '<h1 class="text-2xl font-bold mt-8">$1</h1>')
    // 无序列表 - item
    md = md.replace(/^-\s+(.*)$/gm, '<li>$1</li>')
    md = md.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul class="list-disc ml-6">${m}</ul>`) 
    // 链接 [text](url)
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="text-blue-600 underline" href="$2" target="_blank" rel="noopener">$1</a>')
    // 段落
    md = md.replace(/^(?!<h\d>|<ul>|<pre>)(.+)$/gm, '<p class="my-2">$1</p>')
    return md
  }, [text, isMarkdown])

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

