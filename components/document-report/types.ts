"use client"

export interface DocumentNode {
  id: string
  name: string
  type: "file" | "folder"
  parentId?: string | null
  children?: string[]
  uploadDate?: string
  description?: string
  content?: string
  fileSize?: number
}

export interface ReportNode {
  id: string
  name: string
  type: "file" | "folder"
  children?: ReportNode[]
  sourceId?: string
  description?: string
  content?: string
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadDate: string
  content?: string // 新增这一行
}