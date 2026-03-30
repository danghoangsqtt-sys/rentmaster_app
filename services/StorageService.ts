
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const APP_DIRECTORY = Directory.Documents;

export class StorageService {
  /**
   * Lưu một object JSON vào file vật lý
   */
  static async saveJson(filename: string, data: any): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: `rentmaster/${filename}.json`,
        data: JSON.stringify(data),
        directory: APP_DIRECTORY,
        encoding: Encoding.UTF8,
        recursive: true
      });
    } catch (e) {
      console.error('Error saving JSON:', e);
    }
  }

  /**
   * Đọc object JSON từ file vật lý
   */
  static async readJson(filename: string): Promise<any | null> {
    try {
      const result = await Filesystem.readFile({
        path: `rentmaster/${filename}.json`,
        directory: APP_DIRECTORY,
        encoding: Encoding.UTF8,
      });
      return JSON.parse(result.data as string);
    } catch (e) {
      return null;
    }
  }

  /**
   * Lưu file media (blob/base64) vào bộ nhớ vật lý và trả về URI
   */
  static async saveMedia(data: string, prefix: string = 'media'): Promise<string> {
    let extension = 'png';
    let base64Data = data;
    
    // Nếu data có chứa header data:image/png;base64, hoặc data:video/mp4;base64, , hãy trích xuất extension và cắt bỏ phần header
    if (data.startsWith('data:')) {
      const mimeMatch = data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      if (mimeMatch && mimeMatch[1]) {
        const mimeType = mimeMatch[1];
        if (mimeType.includes('video')) {
          extension = mimeType.split('/')[1] || 'mp4';
        } else if (mimeType.includes('image')) {
          extension = mimeType.split('/')[1] || 'png';
        }
      }
      base64Data = data.split(',')[1];
    }

    const fileName = `${prefix}-${Date.now()}.${extension}`;
    


    const result = await Filesystem.writeFile({
      path: `rentmaster/media/${fileName}`,
      data: base64Data,
      directory: APP_DIRECTORY,
      recursive: true
    });

    return result.uri;
  }

  /**
   * Chuyển đổi file path sang URL có thể hiển thị trong WebView
   */
  static getDisplayUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return Capacitor.convertFileSrc(path);
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Loại bỏ phần header "data:image/png;base64,"
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
