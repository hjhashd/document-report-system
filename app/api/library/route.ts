// app/api/library/route.ts
import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs' // 使用 Node.js 的文件系统模块
import { DocumentNode } from '@/components/document-report/types' // 导入你的类型

// 资料库在 public 目录下的根路径
const LIBRARY_ROOT_PATH = 'public/processed_library'
// 对应的 URL 基础路径
const LIBRARY_BASE_URL = '/files/processed_library'

// 递归函数，用于读取目录结构
async function readDirectoryStructure(
    dirPath: string,        // 当前物理路径
    parentId: string | null, // 父节点ID
    baseUrl: string         // 当前对应的 URL 路径
): Promise<DocumentNode[]> {
    
    let nodes: DocumentNode[] = [];
    
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(dirPath, entry.name);
            const entryId = `lib-${Buffer.from(entryPath).toString('hex')}`; // 基于路径生成唯一ID
            const entryUrl = `${baseUrl}/${entry.name}`;

            if (entry.isDirectory()) {
                // 这是个文件夹
                const folderNode: DocumentNode = {
                    id: entryId,
                    name: entry.name, // 文件夹名 (例如 "XA_证书")
                    type: "folder",
                    parentId: parentId,
                    children: [], // 将在递归中填充
                };
                
                // 递归读取子目录
                const childrenNodes = await readDirectoryStructure(entryPath, entryId, entryUrl);
                
                // 添加子节点的 ID
                folderNode.children = childrenNodes.filter(n => n.type === 'file').map(n => n.id);
                
                // 将文件夹节点和它所有的子文件节点都加入列表
                nodes.push(folderNode, ...childrenNodes);

            } else if (entry.isFile() && (entry.name.endsWith('.docx') || entry.name.endsWith('.pdf'))) {
                // 这是个文件
                const stats = await fs.stat(entryPath);
                
                // 清理文件名 (例如 "01_第一章_概述.docx" -> "第一章 概述")
                let cleanName = entry.name.replace(/\.docx$|\.pdf$/i, ""); // 移除扩展名
                cleanName = cleanName.replace(/^\d+_/g, ""); // 移除开头的 "01_" 编号
                cleanName = cleanName.replace(/_/g, " "); // 替换下划线为空格
                
                const fileNode: DocumentNode = {
                    id: entryId,
                    name: cleanName, // 使用清理后的"友好"名称
                    type: "file",
                    parentId: parentId,
                    url: entryUrl, // 关键：指向文件的公开 URL
                    fileSize: stats.size,
                    fileType: entry.name.endsWith('.pdf') 
                        ? 'application/pdf' 
                        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                };
                nodes.push(fileNode);
            }
        }
    } catch (error) {
        console.error(`读取目录 ${dirPath} 出错:`, error);
        // 如果目录不存在或无法读取，返回空数组
    }
    
    // 过滤掉文件夹节点，因为它们已经被递归处理并内联了
    // 我们只返回一个扁平的节点列表
    const finalNodes = await fs.readdir(dirPath, { withFileTypes: true });
    const resultNodes: DocumentNode[] = [];

    for (const entry of finalNodes) {
        const entryPath = path.join(dirPath, entry.name);
        const entryId = `lib-${Buffer.from(entryPath).toString('hex')}`;
        const entryUrl = `${baseUrl}/${entry.name}`;

        if (entry.isDirectory()) {
            const folderNode: DocumentNode = {
                id: entryId,
                name: entry.name,
                type: "folder",
                parentId: parentId,
                children: [], // 会在下一步填充
            };
            
            const childEntries = await fs.readdir(entryPath, { withFileTypes: true });
            const childFileNodes: DocumentNode[] = [];

            for (const childEntry of childEntries) {
                if (childEntry.isFile() && (childEntry.name.endsWith('.docx') || childEntry.name.endsWith('.pdf'))) {
                    const childPath = path.join(entryPath, childEntry.name);
                    const childId = `lib-${Buffer.from(childPath).toString('hex')}`;
                    const childUrl = `${entryUrl}/${childEntry.name}`;
                    const stats = await fs.stat(childPath);

                    let cleanName = childEntry.name.replace(/\.docx$|\.pdf$/i, "");
                    cleanName = cleanName.replace(/^\d+_/g, "");
                    cleanName = cleanName.replace(/_/g, " ");

                    const fileNode: DocumentNode = {
                        id: childId,
                        name: cleanName,
                        type: "file",
                        parentId: entryId, // 父ID是这个文件夹
                        url: childUrl,
                        fileSize: stats.size,
                        fileType: childEntry.name.endsWith('.pdf') 
                            ? 'application/pdf' 
                            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    };
                    childFileNodes.push(fileNode);
                }
            }
            
            folderNode.children = childFileNodes.map(n => n.id);
            resultNodes.push(folderNode, ...childFileNodes);
        }
        // 我们只处理第一层文件夹，忽略根目录下的文件
    }
    return resultNodes;
}

export async function GET() {
    try {
        // 1. 找到 "public/processed_library" 的物理路径
        const libraryPath = path.join(process.cwd(), LIBRARY_ROOT_PATH);

        // 2. 递归读取结构
        const structure = await readDirectoryStructure(libraryPath, null, LIBRARY_BASE_URL);

        // 3. 返回数据
        return NextResponse.json(structure);
        
    } catch (error) {
        console.error(`读取资料库结构失败:`, error);
        return NextResponse.json(
            { error: `读取资料库结构失败。请确保 'public/processed_library' 目录存在。` },
            { status: 500 }
        );
    }
}