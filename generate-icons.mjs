// Script tạo icon Android từ logo RentMaster Pro
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(__dirname, 'rentmaster_logo.png');
const RES = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Android mipmap sizes chuẩn
const sizes = [
  { folder: 'mipmap-mdpi',    size: 48 },
  { folder: 'mipmap-hdpi',    size: 72 },
  { folder: 'mipmap-xhdpi',   size: 96 },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Adaptive icon foreground cần lớn hơn (108dp * density)
const fgSizes = [
  { folder: 'mipmap-mdpi',    size: 108 },
  { folder: 'mipmap-hdpi',    size: 162 },
  { folder: 'mipmap-xhdpi',   size: 216 },
  { folder: 'mipmap-xxhdpi',  size: 324 },
  { folder: 'mipmap-xxxhdpi', size: 432 },
];

async function generate() {
  for (const { folder, size } of sizes) {
    const outDir = path.join(RES, folder);
    
    // ic_launcher.png (square icon)
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));
    
    // ic_launcher_round.png (circular icon)
    // Tạo mask tròn
    const roundMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
    );
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: roundMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));
      
    console.log(`✅ ${folder}: ${size}x${size}px`);
  }
  
  // Foreground cho adaptive icon
  for (const { folder, size } of fgSizes) {
    const outDir = path.join(RES, folder);
    // Foreground icon: logo nhỏ hơn nằm giữa khung lớn (72/108 = 66%)
    const logoSize = Math.round(size * 0.66);
    const padding = Math.round((size - logoSize) / 2);
    
    const resizedLogo = await sharp(SOURCE)
      .resize(logoSize, logoSize, { fit: 'cover' })
      .png()
      .toBuffer();
      
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } }
    })
      .composite([{ input: resizedLogo, left: padding, top: padding }])
      .png()
      .toFile(path.join(outDir, 'ic_launcher_foreground.png'));
    
    console.log(`✅ ${folder} foreground: ${size}x${size}px`);
  }
  
  console.log('\n🎉 Tất cả icon Android đã được tạo thành công!');
}

generate().catch(console.error);
