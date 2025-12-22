
import React from 'react';
import { Camera, X, Image as ImageIcon, Plus, Video } from 'lucide-react';
import { StorageService } from '../services/StorageService';

interface PhotoPickerProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  accept?: string;
}

const PhotoPicker: React.FC<PhotoPickerProps> = ({ label, images, onChange, multiple = false, accept = "image/*" }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [...images];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      });
      
      reader.readAsDataURL(file);
      const base64 = await promise;
      
      if (multiple) {
        newImages.push(base64);
      } else {
        onChange([base64]);
        return;
      }
    }
    
    onChange(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const isVideo = (data: string) => data.startsWith('data:video');

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
        <Camera size={12} /> {label}
      </label>
      
      <div className="grid grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm group bg-slate-100 flex items-center justify-center">
            {isVideo(img) ? (
              <div className="flex flex-col items-center">
                <Video size={24} className="text-blue-500" />
                <span className="text-[8px] font-bold text-blue-500 uppercase mt-1">Video</span>
              </div>
            ) : (
              <img src={StorageService.getDisplayUrl(img)} className="w-full h-full object-cover" alt="" />
            )}
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-lg shadow-lg active:scale-90 transition-transform"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        
        {(multiple || images.length === 0) && (
          <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer bg-white">
            <Plus size={24} strokeWidth={1.5} />
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Thêm</span>
            <input 
              type="file" 
              className="hidden" 
              accept={accept} 
              multiple={multiple}
              onChange={handleFileChange} 
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default PhotoPicker;
