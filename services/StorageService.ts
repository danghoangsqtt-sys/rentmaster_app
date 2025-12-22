
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
   * Lưu file media (blob) vào bộ nhớ vật lý và trả về URI
   */
  static async saveMedia(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const base64Data = await this.fileToBase64(file);

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
