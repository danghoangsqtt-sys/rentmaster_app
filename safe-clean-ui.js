const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(path.join(__dirname, 'pages'), (filePath) => {
  if (filePath.endsWith('.tsx') && !filePath.includes('node_modules')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Khóa sáng Light Mode: Gỡ toàn bộ dark:<class>
    content = content.replace(/dark:[a-zA-Z0-9\-\/\[\]\.]+/g, '');
    
    // Khắc phục lỗi "các ô quá to" ở các form (PropertyForm, OwnerForm, etc)
    content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-2xl');
    content = content.replace(/rounded-\[1\.75rem\]/g, 'rounded-xl');
    
    // Giảm chữ
    content = content.replace(/text-3xl/g, 'text-2xl');

    // Chuyển nền chính (bg-slate-50 min-h-full) thành bg-white min-h-full
    content = content.replace(/bg-slate-50 min-h-full/g, 'bg-white min-h-full');
    content = content.replace(/bg-slate-50 pb-20/g, 'bg-white pb-20');
    content = content.replace(/bg-slate-50 pb-24/g, 'bg-white pb-24');

    // Clean space safely
    content = content.replace(/ +/g, ' '); 
    content = content.replace(/ "/g, '"');
    content = content.replace(/" /g, '"');

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log("Done refactoring UI across all pages safely.");
