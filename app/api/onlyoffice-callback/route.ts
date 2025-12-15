import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    console.log("[OnlyOffice Callback] 收到回调数据:", JSON.stringify(data, null, 2))
    
    const status = data?.status
    const key = data?.key
    
    console.log(`[OnlyOffice Callback] 状态: ${status}, Key: ${key}`)
    
    if (status === 2 || status === 6) {
      console.log("[OnlyOffice Callback] 处理保存操作 (状态 2 或 6)")
      const url = data?.url
      if (!url) {
        console.error("[OnlyOffice Callback] 错误: 缺少 URL")
        return NextResponse.json({ error: "missing url" }, { status: 400 })
      }
      
      console.log(`[OnlyOffice Callback] 从 URL 获取文件: ${url}`)
      const resp = await fetch(url)
      if (!resp.ok) {
        console.error(`[OnlyOffice Callback] 下载失败: HTTP ${resp.status}`)
        return NextResponse.json({ error: "download failed" }, { status: 502 })
      }
      
      const buf = Buffer.from(await resp.arrayBuffer())
      console.log(`[OnlyOffice Callback] 成功下载文件，大小: ${buf.length} 字节`)
      
      let savePath: string
      let decoded: string | null = null
      try {
        decoded = key ? Buffer.from(String(key), "base64").toString() : null
        console.log(`[OnlyOffice Callback] 解码后的路径: ${decoded}`)
      } catch (e) {
        console.error("[OnlyOffice Callback] Key 解码失败:", e)
        decoded = null
      }
      
      if (decoded && decoded.startsWith("/")) {
        const p = new URL("http://x" + decoded)
        savePath = path.join(process.cwd(), "public", p.pathname)
        console.log(`[OnlyOffice Callback] 使用解码路径保存: ${savePath}`)
      } else {
        const name = path.basename(new URL(url).pathname)
        const dir = path.join(process.cwd(), "public", "uploads", "saved")
        console.log(`[OnlyOffice Callback] 创建保存目录: ${dir}`)
        await mkdir(dir, { recursive: true })
        savePath = path.join(dir, name)
        console.log(`[OnlyOffice Callback] 使用默认路径保存: ${savePath}`)
      }
      
      try {
        await writeFile(savePath, buf)
        console.log(`[OnlyOffice Callback] 文件保存成功: ${savePath}`)
        return NextResponse.json({ error: 0 })
      } catch (writeError) {
        console.error("[OnlyOffice Callback] 文件写入失败:", writeError)
        return NextResponse.json({ error: 1, message: String(writeError) })
      }
    }
    
    console.log(`[OnlyOffice Callback] 返回成功响应，状态: ${status}`)
    return NextResponse.json({ error: 0 })
  } catch (e) {
    console.error("[OnlyOffice Callback] 处理回调时发生错误:", e)
    return NextResponse.json({ error: "invalid body", details: String(e) }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
