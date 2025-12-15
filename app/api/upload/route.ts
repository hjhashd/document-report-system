import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, stat } from 'fs/promises';
import path from 'path';
import { updateFileStatus } from '@/lib/fileStatusStore';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const parentId = data.get('parentId') as string | null;
  const rawUserId = (data.get('userId') as string | null) || undefined;
  const rawTaskId = (data.get('taskId') as string | null) || undefined;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
  }

  // 校验用户ID
  if (!rawUserId || !/^\d+$/.test(rawUserId)) {
    return NextResponse.json({ success: false, error: 'Invalid userId' }, { status: 400 });
  }

  const originalName = typeof file.name === 'string' ? file.name : 'uploaded-file';
  const baseName = path.basename(originalName);
  const safeFileName = baseName
    .replace(/\u0000/g, '')
    .replace(/[\\\/]/g, '-')
    .replace(/^\.+/, '')
    .replace(/\s+/g, ' ')
    .slice(0, 255);

  // 1. 将文件保存到本地
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 2. 计算任务ID（auto则递增）
  let taskIdToUse: string | undefined = rawTaskId;
  if (!taskIdToUse || taskIdToUse.toLowerCase() === 'auto') {
    try {
      const userRoot = path.join(process.cwd(), 'public', 'uploads', rawUserId);
      let maxId = 0;
      try {
        const entries = await readdir(userRoot, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && /^\d+$/.test(entry.name)) {
            const n = parseInt(entry.name, 10);
            if (n > maxId) maxId = n;
          }
        }
      } catch (_) {
        // 用户目录不存在时，maxId 保持为 0
      }
      taskIdToUse = String(maxId + 1);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Failed to determine taskId' }, { status: 500 });
    }
  }

  // 校验任务ID
  if (!/^\d+$/.test(taskIdToUse)) {
    return NextResponse.json({ success: false, error: 'Invalid taskId' }, { status: 400 });
  }

  // 3. 目标保存路径：public/uploads/[userId]/[taskId]/原文件名
  const targetDir = path.join(process.cwd(), 'public', 'uploads', rawUserId, taskIdToUse);
  const localPath = path.join(targetDir, safeFileName);

  try {
    await mkdir(targetDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
    return NextResponse.json({ success: false, error: 'Failed to create directories' }, { status: 500 });
  }

  try {
    await writeFile(localPath, buffer);
  } catch (error) {
    console.error('Error writing file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file' }, { status: 500 });
  }

  // 4. 生成一个公开的 URL
  const publicUrl = `/uploads/${rawUserId}/${taskIdToUse}/${encodeURIComponent(safeFileName)}`;

  // 5. 生成 docId
  const newDocId = `doc-${Date.now()}`;
  
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
      file_url: `http://你的NextJS服务器地址${publicUrl}`
    }),
  }).catch(e => console.error("Failed to trigger processing:", e)); // 别忘了处理错误

  // 6. 立刻返回给前端，告诉前端任务已开始
  return NextResponse.json({
    docId: newDocId,
    name: safeFileName,
    status: 'PENDING', // 关键状态
    parentId: parentId,
    fileSize: file.size,
    uploadDate: new Date().toISOString(),
    userId: rawUserId,
    taskId: taskIdToUse,
    url: publicUrl
  });
}
