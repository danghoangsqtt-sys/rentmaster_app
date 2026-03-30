import React, { useState, useEffect } from 'react';
import { Bell, HardDrive, Camera, X } from 'lucide-react';
import { requestNotificationPermission, requestStoragePersistence } from '../utils/permissionUtils';

interface Props {
  onComplete: () => void;
}

export const PermissionModal: React.FC<Props> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Kích hoạt animation trượt lên sau khi mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGrantPermissions = async () => {
    setIsProcessing(true);
    
    // Xin các quyền cốt lõi của PWA
    await requestNotificationPermission();
    await requestStoragePersistence();
    
    // Đóng form mượt mà
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300); // Đợi animation slide down hoàn tất
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-300 ${isVisible ? 'bg-[#0f172a]/40 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
      <div className={`w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-2xl transition-transform duration-300 transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[18px] font-black text-slate-800 tracking-tight">Cấp quyền Ứng dụng</h2>
          <button title="Đóng" onClick={handleSkip} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full active:scale-90 transition-transform">
            <X size={16} strokeWidth={2.5}/>
          </button>
        </div>

        <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6">
          Để Rent Master Pro mang lại trải nghiệm chuyên nghiệp hệt như App nội bộ, vui lòng cho phép chúng tôi truy cập:
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 items-start p-4 bg-blue-50/50 rounded-[20px] border border-blue-100/50">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
               <Bell size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-800 mb-1">Quyền Gửi thông báo</h4>
              <p className="text-[11px] text-slate-500 leading-snug">Nhận cảnh báo ngay lập tức khi Hợp đồng rớt hạn, Visa hết hạn hoặc có sự cố phát sinh.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 bg-emerald-50/50 rounded-[20px] border border-emerald-100/50">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
               <HardDrive size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-800 mb-1">Lưu trữ Ngoại tuyến vĩnh viễn</h4>
              <p className="text-[11px] text-slate-500 leading-snug">Cho phép khóa bộ nhớ nội bộ, bảo vệ 100% dữ liệu hình ảnh CCCD, hợp đồng khỏi việc trình duyệt tự động dọn rác.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 bg-amber-50/50 rounded-[20px] border border-amber-100/50">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
               <Camera size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-800 mb-1">Thư viện Ảnh & Camera</h4>
              <p className="text-[11px] text-slate-500 leading-snug">Gửi giấy tờ pháp lý chuẩn xác. (Hệ thống sẽ chỉ tự kích hoạt hỏi quyền khi bạn chạm vào nút Tải ảnh Lên).</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGrantPermissions} 
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white rounded-[16px] py-4 text-[14px] font-black tracking-widest uppercase active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] disabled:opacity-70 disabled:active:scale-100"
        >
          {isProcessing ? 'Đang thiết lập...' : 'Cho phép tất cả & Bắt đầu'}
        </button>
        <div className="text-center mt-4">
          <button onClick={handleSkip} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest active:text-slate-600">
            Bỏ qua lúc này
          </button>
        </div>
      </div>
    </div>
  );
};
