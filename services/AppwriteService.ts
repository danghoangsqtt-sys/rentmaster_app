import { Client, Databases, Storage, ID, Query } from 'appwrite';
import { Property, Owner, ScheduleEvent, UserProfile, UserAccount } from '../types';
import { StorageService } from './StorageService';

// ==========================================
// CẤU HÌNH APPWRITE: BẠN CẦN ĐIỀN ID VÀO ĐÂY
// ==========================================
const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID || '69c9c1cd0033d191f1d5';
const APPWRITE_DATABASE_ID = (import.meta as any).env?.VITE_APPWRITE_DATABASE_ID || '69c9c20800386273d4df';
const APPWRITE_BUCKET_ID = (import.meta as any).env?.VITE_APPWRITE_BUCKET_ID || 'media';


// Collection IDs
const COL_PROPERTIES = 'properties';
const COL_OWNERS = 'owners';
const COL_SCHEDULES = 'schedules';
const COL_USERS = 'users'; // Dùng cho UserAccount/Profile nếu cần đồng bộ (Profile)

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);

/**
 * Service trung tâm kết nối Appwrite
 * Biến đổi Object TypeScript thành Document Appwrite (xử lý JSON stringify)
 */
export class AppwriteService {
  /**
   * Kiểm tra xem người dùng đã nhập Project ID thật chưa
   */
  static isConfigured(): boolean {
    return APPWRITE_PROJECT_ID !== 'YOUR_PROJECT_ID_HERE';
  }

  // --- PROPERTIES ---
  static async getProperties(): Promise<Property[]> {
    if (!this.isConfigured()) return (await StorageService.readJson('properties')) || [];
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, COL_PROPERTIES, [Query.limit(100)]);
      return response.documents.map(doc => {
        // Parse nested JSON
        const property: any = { ...doc };
        if (doc.assets) property.assets = JSON.parse(doc.assets);
        if (doc.tenant) property.tenant = JSON.parse(doc.tenant);
        if (doc.utilities) property.utilities = JSON.parse(doc.utilities);
        
        // Convert array of images/videos manually if they were stored as string JSON,
        // but since we defined them as String (Array), Appwrite returns them directly as []
        property.id = doc.$id;
        return property as Property;
      });
    } catch (e) {
      console.error("Lỗi getProperties Appwrite:", e);
      return [];
    }
  }

  static async saveProperties(properties: Property[]): Promise<void> {
    if (!this.isConfigured()) {
      await StorageService.saveJson('properties', properties);
      return;
    }
    
    // Thuật toán ghi: Đoạn này nên tối ưu tuỳ logic. Do yêu cầu đồng bộ toàn bộ mảng thay vì chỉnh sửa lẻ
    // ta có thể thực hiện xoá cũ tạo mới hoặc update. Để an toàn, đây là hàm ví dụ update Document
    for (const p of properties) {
      const dataToSave = {
        name: p.name,
        type: p.type,
        address: p.address,
        description: p.description,
        structure: p.structure,
        condition: p.condition,
        status: p.status,
        totalAssetValue: p.totalAssetValue,
        imageUrl: p.imageUrl,
        gallery: p.gallery || [],
        ownerId: p.ownerId,
        constructionYear: p.constructionYear,
        operationStartDate: p.operationStartDate,
        assets: JSON.stringify(p.assets || []),
        tenant: p.tenant ? JSON.stringify(p.tenant) : null,
        utilities: p.utilities ? JSON.stringify(p.utilities) : null,
        rating: p.rating || 0,
        propertyNotes: p.propertyNotes || ''
      };

      try {
        await databases.getDocument(APPWRITE_DATABASE_ID, COL_PROPERTIES, p.id);
        await databases.updateDocument(APPWRITE_DATABASE_ID, COL_PROPERTIES, p.id, dataToSave);
      } catch (err: any) {
        if (err.code === 404) {
          await databases.createDocument(APPWRITE_DATABASE_ID, COL_PROPERTIES, p.id, dataToSave);
        } else {
          console.error("Lỗi khi saveProperty", err);
        }
      }
    }
  }

  // --- OWNERS ---
  static async getOwners(): Promise<Owner[]> {
    if (!this.isConfigured()) return (await StorageService.readJson('owners')) || [];
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, COL_OWNERS, [Query.limit(100)]);
      return response.documents.map(doc => {
        const owner: any = { ...doc };
        owner.id = doc.$id;
        return owner as Owner;
      });
    } catch (e) {
      console.error("Lỗi getOwners Appwrite:", e);
      return [];
    }
  }

  static async saveOwners(owners: Owner[]): Promise<void> {
    if (!this.isConfigured()) {
      await StorageService.saveJson('owners', owners);
      return;
    }
    for (const o of owners) {
      // Tự động kiểm tra và convert Base64 sang URL ngắn nếu có (bảo vệ giới hạn DB Schema frontend/backend)
      let finalAvatarUrl = o.avatarUrl;
      let finalIdFront = o.idCardFront;
      let finalIdBack = o.idCardBack;
      
      if (finalAvatarUrl?.startsWith('data:image')) finalAvatarUrl = await this.uploadMedia(finalAvatarUrl, 'owner-avatar');
      if (finalIdFront?.startsWith('data:image')) finalIdFront = await this.uploadMedia(finalIdFront, 'id-front');
      if (finalIdBack?.startsWith('data:image')) finalIdBack = await this.uploadMedia(finalIdBack, 'id-back');
      
      const dataToSave = {
        name: o.name,
        phones: o.phones || [],
        address: o.address || '',
        avatarUrl: finalAvatarUrl || '',
        idCardFront: finalIdFront || '',
        idCardBack: finalIdBack || '',
        managementStartDate: o.managementStartDate || new Date().toISOString()
      };
      try {
        await databases.getDocument(APPWRITE_DATABASE_ID, COL_OWNERS, o.id);
        await databases.updateDocument(APPWRITE_DATABASE_ID, COL_OWNERS, o.id, dataToSave);
      } catch (err: any) {
        if (err.code === 404) {
          await databases.createDocument(APPWRITE_DATABASE_ID, COL_OWNERS, o.id, dataToSave);
        }
      }
    }
  }

  // --- SCHEDULES ---
  static async getSchedules(): Promise<ScheduleEvent[]> {
    if (!this.isConfigured()) return (await StorageService.readJson('schedule')) || [];
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, COL_SCHEDULES, [Query.limit(100)]);
      return response.documents.map(doc => ({ ...doc, id: doc.$id } as unknown as ScheduleEvent));
    } catch (e) {
      console.error("Lỗi getSchedules Appwrite:", e);
      return [];
    }
  }

  static async saveSchedules(schedules: ScheduleEvent[]): Promise<void> {
    if (!this.isConfigured()) {
      await StorageService.saveJson('schedule', schedules);
      return;
    }
    for (const s of schedules) {
      const dataToSave = {
        title: s.title,
        description: s.description || '',
        date: s.date,
        time: s.time,
        type: s.type,
        priority: s.priority,
        propertyId: s.propertyId || '',
        isCompleted: s.isCompleted,
        reminderMinutes: s.reminderMinutes || 0,
        repeat: s.repeat || 'none'
      };
      try {
        await databases.getDocument(APPWRITE_DATABASE_ID, COL_SCHEDULES, s.id);
        await databases.updateDocument(APPWRITE_DATABASE_ID, COL_SCHEDULES, s.id, dataToSave);
      } catch (err: any) {
        if (err.code === 404) {
          await databases.createDocument(APPWRITE_DATABASE_ID, COL_SCHEDULES, s.id, dataToSave);
        }
      }
    }
  }


  // --- MEDIA STORAGE (BUCKET) ---
  
  /**
   * Tải File Base64 lên Bucket Appwrite Storage, trả về File URL (nén cho ảnh WebP, view gốc cho file khác).
   */
  static async uploadMedia(base64Data: string, prefix: string = 'media'): Promise<string> {
    // Để an toàn và hỗ trợ backwards-compatibility với Local Storage, nếu chuỗi ko phải Base64 thì bỏ qua
    if (!base64Data || base64Data.startsWith('http')) return base64Data;
    
    if (!this.isConfigured()) {
      // Fallback tạm thời nếu chưa setup Appwrite, trả về base64 thuần
      return await StorageService.saveMedia(base64Data, prefix); 
    }

    try {
      let mimeType = 'image/png';
      let cleanBase64 = base64Data;
      let extension = 'png';
      
      // Xử lý tiền tố data:image/png;base64,
      if (base64Data.startsWith('data:')) {
        const mimeMatch = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        if (mimeMatch && mimeMatch[1]) {
          mimeType = mimeMatch[1];
          extension = mimeType.split('/')[1] || 'png';
        }
        cleanBase64 = base64Data.split(',')[1];
      }
      
      // Convert base64 sang Blob
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const file = new File([blob], `${prefix}-${Date.now()}.${extension}`, { type: mimeType });
      
      // API Upload File
      const uploadRes = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
      
      // Return file View URL or Preview URL (Tiết kiệm Bandwidth)
      const isImage = mimeType.startsWith('image/');
      let fileUrl = '';
      if (isImage) {
        // Trả file nén (.webp, chất lượng 80%, width max 1000px) thay vì ảnh gốc 5MB
        fileUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${uploadRes.$id}/preview?project=${APPWRITE_PROJECT_ID}&width=1000&quality=80&output=webp`;
      } else {
        fileUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${uploadRes.$id}/view?project=${APPWRITE_PROJECT_ID}`;
      }
      return fileUrl;
    } catch (e) {
      console.error("Lỗi upload media Appwrite:", e);
      return base64Data;
    }
  }

  /**
   * Xoá File từ Appwrite Storage dựa trên URL
   * Giúp ứng dụng chủ động dọn rác, giải phóng 2GB Storage giới hạn.
   */
  static async deleteMedia(fileUrl: string): Promise<boolean> {
    if (!this.isConfigured() || !fileUrl || !fileUrl.includes('/storage/buckets/')) return false;

    try {
      // Phân tích URL Appwrite để lấy file Id
      // URL Format: https://.../v1/storage/buckets/{bucketId}/files/{fileId}/...
      const regex = /\/files\/([a-zA-Z0-9_-]+)\//;
      const match = fileUrl.match(regex);
      
      if (match && match[1]) {
        const fileId = match[1];
        await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Lỗi xoá media Appwrite:", e);
      return false;
    }
  }

}
