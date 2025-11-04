// 文件状态共享存储模块
// 在实际项目中，这里应该连接到数据库或共享状态存储
// 由于这是模拟环境，我们将使用一个简单的内存存储
// 注意：在生产环境中，这种方式不适用于多实例部署

// 模拟的文件状态存储
const fileStatusStore: { [key: string]: { status: string; finalUrl?: string; errorMessage?: string } } = {};

// 这个函数用于更新文件状态（模拟后端处理）
export function updateFileStatus(docId: string, status: string, finalUrl?: string, errorMessage?: string) {
  fileStatusStore[docId] = {
    status,
    finalUrl,
    errorMessage
  };
  console.log(`文件状态更新: ${docId} -> ${status}`);
}

// 这个函数用于获取文件状态
export function getFileStatus(docId: string) {
  return fileStatusStore[docId];
}

// 这个函数用于检查文件是否存在
export function fileExists(docId: string) {
  return !!fileStatusStore[docId];
}