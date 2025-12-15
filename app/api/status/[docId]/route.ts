import { NextRequest, NextResponse } from 'next/server';
import { getFileStatus, fileExists } from '@/lib/fileStatusStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params;

  // 如果文件不存在，返回404
  if (!fileExists(docId)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // 获取文件状态
  const fileStatus = getFileStatus(docId);

  // 返回文件状态
  return NextResponse.json({
    id: docId,
    status: fileStatus.status,
    final_url: fileStatus.finalUrl,
    error_message: fileStatus.errorMessage
  });
}