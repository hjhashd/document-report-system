"use client"

export interface DocumentNode {
  id: string
  name: string
  type: "file" | "folder"
  parentId?: string | null
  children?: string[]
  uploadDate?: string
  description?: string
  content?: string | ArrayBuffer
  fileSize?: number
  fileType?: string
  url?: string
  status?: string
}

export interface ReportNode {
  id: string
  name: string
  type: "file" | "folder"
  children?: ReportNode[]
  sourceId?: string
  description?: string
  content?: string | ArrayBuffer
  fileType?: string
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadDate: string
  content?: string | ArrayBuffer
  fileType?: string
}