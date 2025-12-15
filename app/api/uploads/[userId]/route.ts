import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { DocumentNode } from '@/components/document-report/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const userUploadsDir = path.join(process.cwd(), 'public', 'uploads', userId);
  const uploadsBaseUrl = `/uploads/${userId}`;

  try {
    const nodes: DocumentNode[] = [];
    
    // Check if user directory exists
    try {
        await stat(userUploadsDir);
    } catch (e) {
        // If directory doesn't exist, return empty array
        return NextResponse.json([]);
    }

    const entries = await readdir(userUploadsDir, { withFileTypes: true });

    for (const entry of entries) {
      // We expect directories here, representing tasks (e.g., '1', '2')
      if (entry.isDirectory()) {
        const taskId = entry.name;
        const taskDir = path.join(userUploadsDir, taskId);
        
        try {
            const taskEntries = await readdir(taskDir, { withFileTypes: true });
            
            for (const taskEntry of taskEntries) {
                if (taskEntry.isFile()) {
                    const filePath = path.join(taskDir, taskEntry.name);
                    const fileStats = await stat(filePath);
                    const fileUrl = `${uploadsBaseUrl}/${taskId}/${encodeURIComponent(taskEntry.name)}`;
                    const docId = `upload-${userId}-${taskId}-${Buffer.from(taskEntry.name).toString('hex')}`;

                    nodes.push({
                        id: docId,
                        name: taskEntry.name,
                        type: 'file',
                        parentId: null, // Top level in "My Uploads" view
                        url: fileUrl,
                        fileSize: fileStats.size,
                        fileType: taskEntry.name.endsWith('.pdf') 
                            ? 'application/pdf' 
                            : taskEntry.name.endsWith('.xlsx')
                            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            : taskEntry.name.endsWith('.docx')
                            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            : 'application/octet-stream',
                        userId: userId,
                        taskId: taskId
                    });
                }
            }
        } catch (err) {
            console.error(`Error reading task directory ${taskId}:`, err);
            // Continue to next task directory
        }
      }
    }

    return NextResponse.json(nodes);

  } catch (error) {
    console.error(`Error reading uploads for user ${userId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}
