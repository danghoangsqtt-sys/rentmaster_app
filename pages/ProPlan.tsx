
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Copy, Landmark, User, Zap, Sparkles } from 'lucide-react';

const ProPlan: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    "Quản lý KHÔNG GIỚI HẠN số lượng căn hộ",
    "Thông báo nhắc nợ tự động qua hệ thống",
    "Báo cáo tài chính & doanh thu chuyên sâu",
    "Lưu trữ hồ sơ khách thuê trên Cloud bảo mật",
    "Hỗ trợ ưu tiên 24/7 từ đội ngũ kỹ thuật"
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã sao chép: ' + text);
  };

  return (
    <div className="min-h-full bg-slate-50 pb-20 animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-1.5 bg-slate-50 rounded-lg text-slate-500 active:scale-90 transition-transform">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Gói dịch vụ Pro</h2>
      </div>

      <div className="p-5 space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-[2.5rem] p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
              <Zap size={24} className="fill-white" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tight">RentMaster Pro</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mt-1">Gói thành viên ưu tú</p>
            
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-black">150.000đ</span>
              <span className="text-[10px] font-black opacity-80 uppercase bg-white/20 px-2 py-0.5 rounded-md ml-2">Trọn đời</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-500" /> Đặc quyền của bạn
          </h4>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <p className="text-xs font-bold text-slate-600 leading-snug">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thông tin thanh toán</h4>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Landmark size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Ngân hàng</p>
                  <h5 className="text-xs font-black text-slate-800">MB BANK (Quân Đội)</h5>
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Số tài khoản</p>
                  <h5 className="text-sm font-black text-blue-600 tracking-wider">052275581010</h5>
                </div>
              </div>
              <button onClick={() => handleCopy('052275581010')} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                <Copy size={16} />
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Chủ tài khoản</p>
                  <h5 className="text-xs font-black text-slate-800 uppercase">LE BA DANG HOANG</h5>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-700 font-bold leading-relaxed italic">
              Nội dung: <span className="font-black">[Email] nang cap Pro</span>. 
              Admin sẽ kích hoạt tài khoản của bạn ngay khi nhận được thanh toán.
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            alert('Thông tin của bạn đã được gửi tới Admin. Vui lòng chờ xác nhận!');
            navigate(-1);
          }}
          className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
        >
          Xác nhận đã chuyển khoản
        </button>
      </div>
    </div>
  );
};

export default ProPlan;
