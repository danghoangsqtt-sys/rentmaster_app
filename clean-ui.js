const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDirs = ['components', 'pages', 'App.tsx'];

walk(__dirname, (filePath) => {
  if (filePath.endsWith('.tsx') && !filePath.includes('node_modules')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Khóa sáng Light Mode: Gỡ toàn bộ dark:<class>
    content = content.replace(/dark:[a-zA-Z0-9\-\/\[\]\.]+/g, '');
    
    // Khắc phục lỗi "các ô quá to": Gỡ bo góc khổng lồ 40px -> 16px
    content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-2xl');
    
    // Gỡ bo góc 28px -> 12px
    content = content.replace(/rounded-\[1\.75rem\]/g, 'rounded-xl');
    
    // Cải thiện lỗi chữ (text-3xl -> text-2xl hoặc xl tuỳ ngữ cảnh)
    content = content.replace(/text-3xl/g, 'text-2xl');
    content = content.replace(/text-2xl/g, 'text-xl');
    
    // Giảm padding qúa lố
    content = content.replace(/p-5/g, 'p-4');
    content = content.replace(/p-6/g, 'p-4');
    content = content.replace(/p-8/g, 'p-5');

    // Chuyển nền chính (bg-slate-50, etc) thành bg-white theo ychiuser:
    // Tuy nhiên, đối với card, sẽ dùng border để phân tách.
    // Replace root component bgs
    content = content.replace(/bg-slate-50/g, 'bg-white');
    content = content.replace(/bg-\[\#F8FAFC\]/g, 'bg-white');
    
    // Làm sạch khoàng trắng thừa do xoá dark:class
    content = content.replace(/\s+/g, ' ').replace(/ \}/g, '}').replace(/ \)/g, ')');
    // Format lại nhẹ nhàng
    content = content.replace(/ className="/g, '\n  className="');

    fs.writeFileSync(filePath, content, 'utf8');
  }
});

// Fix index.html
const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/dark:bg-gray-900/g, '')
           .replace(/dark:text-gray-100/g, '')
           .replace(/bg-gray-50/g, 'bg-white')
           .replace(/<html lang="vi" class="light">/g, '<html lang="vi">')
           .replace(/\.dark body \{[\s\S]*?\}/g, '');
fs.writeFileSync(indexPath, html, 'utf8');

console.log("Done refactoring dark mode and huge elements!");
