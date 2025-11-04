import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { updateFileStatus } from '@/lib/fileStatusStore';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const parentId = data.get('parentId') as string | null; // 我们顺便把 parentId 也传过来

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
  }

  // 1. 将文件保存到本地
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 确保 'public/uploads' 目录存在
  // (你可能需要手动创建 public/uploads 目录)
  const uniqueFileName = `${Date.now()}-${file.name}`;
  const localPath = path.join(process.cwd(), 'public', 'uploads', uniqueFileName);

  try {
    await writeFile(localPath, buffer);
  } catch (error) {
    console.error('Error writing file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file' }, { status: 500 });
  }

  // 2. 生成一个公开的 URL
  // (因为存在 /public 目录下, Next.js 会自动托管它)
  const publicUrl = `/uploads/${uniqueFileName}`;

  // 3. (模拟) 调用你同事的 Python 后端
  // 这是"触发即忘" (fire-and-forget)，我们不 await 它
  const newDocId = `doc-${Date.now()}`; // 你自己生成的唯一 ID
  
  // 初始化文件状态为 PENDING
  updateFileStatus(newDocId, 'PENDING');
  
  // 模拟后端处理过程 - 5秒后更新为 COMPLETED
  setTimeout(() => {
    updateFileStatus(newDocId, 'COMPLETED', publicUrl);
    console.log(`文件 ${newDocId} 处理完成，URL: ${publicUrl}`);
  }, 5000);
  
  // 注意：这里使用占位符URL，实际使用时需要替换为真实的同事后端地址
  fetch('http://同事的Python后端地址/api/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document_id: newDocId,
      // 把你的服务器地址+文件 publicUrl 告诉他
      file_url: `http://你的NextJS服务器地址${publicUrl}`
    }),
  }).catch(e => console.error("Failed to trigger processing:", e)); // 别忘了处理错误

  // 4. 立刻返回给前端，告诉前端任务已开始
  return NextResponse.json({
    id: newDocId,
    name: file.name,
    status: 'PENDING', // 关键状态
    parentId: parentId,
    fileSize: file.size,
    uploadDate: new Date().toISOString()
  });
}