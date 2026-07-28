#!/usr/bin/env node

/**
 * KTV Rhythm 本地服务器启动脚本 (Node.js)
 * 
 * 使用方式:
 *   node start.js
 *   node start.js 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.argv[2]) || 8000;
const HOST = 'localhost';

console.log('\n🎮 KTV Rhythm - 本地服务器启动\n' +
            '================================\n');

// MIME 类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.webm': 'video/webm'
};

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
    // 解析 URL
    const pathname = url.parse(req.url).pathname;
    
    // 处理根路径
    let filePath = pathname === '/' ? '/demo.html' : pathname;
    filePath = path.join(__dirname, filePath);

    // 安全检查：防止目录遍历攻击
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // 读取文件
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`<h1>404 Not Found</h1><p>找不到文件: ${pathname}</p>`);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        } else {
            // 获取文件扩展名
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = mimeTypes[ext] || 'application/octet-stream';

            // 设置 CORS 头
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            });
            res.end(content);

            // 日志
            console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname} - 200`);
        }
    });
});

// 启动服务器
server.listen(PORT, HOST, () => {
    console.log(`✅ 服务器已启动`);
    console.log(`📍 访问地址: http://${HOST}:${PORT}/demo.html`);
    console.log(`📂 项目目录: ${__dirname}`);
    console.log(`⏹️  按 Ctrl+C 停止服务器\n`);
});

// 错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用`);
        console.error(`尝试使用其他端口: node start.js 3000`);
    } else {
        console.error('❌ 服务器错误:', err);
    }
    process.exit(1);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n⏹️  服务器已停止');
    process.exit(0);
});
