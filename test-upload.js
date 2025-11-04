// 简单的测试脚本，用于验证文件上传API
const fs = require('fs');
const path = require('path');

// 创建一个测试文件
const testFilePath = path.join(__dirname, 'test-upload.txt');
const testContent = 'This is a test file for upload API testing.';

// 写入测试文件
fs.writeFileSync(testFilePath, testContent);

console.log('测试文件已创建:', testFilePath);
console.log('您可以使用以下命令测试API:');
console.log('curl -X POST -F "file=@test-upload.txt" -F "parentId=null" http://localhost:3001/api/upload');