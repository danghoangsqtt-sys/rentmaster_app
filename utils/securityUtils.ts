/**
 * Security Utilities cho RentMaster Pro
 * Cung cấp các hàm bảo mật cốt lõi: hash mật khẩu, sanitize đầu vào, logger an toàn.
 */

// ===================== MẬT KHẨU =====================

/**
 * Hash mật khẩu bằng SHA-256 (Web Crypto API - có sẵn trên mọi trình duyệt hiện đại)
 * Trả về chuỗi hex 64 ký tự.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * So sánh mật khẩu plaintext với hash đã lưu.
 */
export async function verifyPassword(plaintext: string, storedHash: string): Promise<boolean> {
  const hash = await hashPassword(plaintext);
  return hash === storedHash;
}

// ===================== SANITIZE =====================

/**
 * Loại bỏ HTML tags nguy hiểm khỏi chuỗi đầu vào.
 * Giữ lại ký tự text thuần, ngăn chặn XSS injection.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Xóa <script> tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Xóa <iframe> tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Xóa <style> tags
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')   // Xóa inline event handlers (onclick="...")
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')   // Xóa inline event handlers (onclick='...')
    .replace(/javascript\s*:/gi, '')         // Xóa javascript: protocol
    .trim();
}

/**
 * Sanitize toàn bộ object (đệ quy): loại bỏ XSS cho mọi trường string.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeInput(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item)) as unknown as T;
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeObject(value);
    }
    return cleaned as T;
  }
  return obj;
}

// ===================== LOGGER =====================

const IS_PRODUCTION = (import.meta as any).env?.PROD ?? false;

/**
 * Logger an toàn cho Production.
 * Ở chế độ Production, chỉ ghi log lỗi giản lược (không lộ stack trace, URL, ID).
 * Ở chế độ Dev, ghi chi tiết đầy đủ giúp debug.
 */
export const secureLog = {
  error: (message: string, ...args: any[]) => {
    if (IS_PRODUCTION) {
      console.error(`[RentMaster] ${message}`);
    } else {
      console.error(`[RentMaster DEV] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.warn(`[RentMaster DEV] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.info(`[RentMaster DEV] ${message}`, ...args);
    }
  }
};

// ===================== FILE UPLOAD =====================

/** Giới hạn kích thước file upload (5MB) */
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Kiểm tra kích thước file Base64 trước khi upload.
 * Base64 tăng kích thước ~33% so với binary, nên ta tính ngược lại.
 */
export function isFileSizeAcceptable(base64Data: string): boolean {
  if (!base64Data) return true;
  
  let cleanBase64 = base64Data;
  if (base64Data.includes(',')) {
    cleanBase64 = base64Data.split(',')[1];
  }
  
  // Tính kích thước gần đúng của binary từ base64
  const sizeInBytes = Math.ceil((cleanBase64.length * 3) / 4);
  return sizeInBytes <= MAX_UPLOAD_SIZE_BYTES;
}
