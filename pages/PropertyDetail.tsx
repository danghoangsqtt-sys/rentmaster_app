
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, User, MapPin, Info, 
  Images, CreditCard, Share2, Copy, Download,
  Play, Video as VideoIcon, X, FileText, Wallet, Clock,
  Calendar, Globe, Link as LinkIcon, ExternalLink, ShieldCheck, CheckCircle,
  Home, Zap, Image as ImageIcon, Share, ClipboardCheck, Edit3, Trash2, Flashlight, Save, Star, AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../data/AppContext';
import { Property, Owner } from '../types';
import { StorageService } from '../services/StorageService';

const PropertyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'tenant' | 'payment'>('info');
  const [copied, setCopied] = useState(false);

  const { properties, owners, updateProperties } = useAppContext();
  
  const [showQuickUpdate, setShowQuickUpdate] = useState(false);
  const [quickUpdateData, setQuickUpdateData] = useState({
    status: 'Available' as 'Rented' | 'Available',
    checkInDate: '',
    contractExpiryDate: '',
    rating: 10,
    propertyNotes: '',
  });
  
  useEffect(() => {
    const p = properties.find((p: Property) => p.id === id);
    if (p) {
      setProperty(p);
      setOwner(owners.find((o: Owner) => o.id === p.ownerId) || null);
      setQuickUpdateData({
        status: p.status,
        checkInDate: p.tenant?.checkInDate || '',
        contractExpiryDate: p.tenant?.contractExpiryDate || '',
        rating: p.rating ?? 10,
        propertyNotes: p.propertyNotes || '',
      });
    }
  }, [id, properties, owners]);

  const togglePaymentStatus = async (type: 'rent' | 'utilities') => {
    if (!property || !property.tenant) return;
    
    const updatedTenant = { ...property.tenant };
    if (type === 'rent') updatedTenant.isRentPaid = !updatedTenant.isRentPaid;
    if (type === 'utilities') updatedTenant.isUtilitiesPaid = !updatedTenant.isUtilitiesPaid;
    
    const updatedProps = properties.map((p: Property) => p.id === id ? { ...p, tenant: updatedTenant } : p);
    await updateProperties(updatedProps);
    setProperty({ ...property, tenant: updatedTenant });
  };

  const handleCopyDetails = () => {
    if (!property) return;
    const details = `THÔNG TIN CHI TIẾT BẤT ĐỘNG SẢN\n` +
                   `--------------------------\n` +
                   `- Tên: ${property.name}\n` +
                   `- Loại hình: ${property.type}\n` +
                   `- Địa chỉ: ${property.address}\n` +
                   `- Mô tả: ${property.description}\n` +
                   `- Mã điện: ${property.utilities.electricityCode}\n` +
                   `- Mã nước: ${property.utilities.waterCode}\n` +
                   `--------------------------\n` +
                   `Quản lý bởi RentMaster Pro`;
    
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMedia = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bất động sản này?')) {
      const updated = properties.filter((p: Property) => p.id !== id);
      await updateProperties(updated);
      navigate('/properties');
    }
  };

  const handleShareTenant = async () => {
    if (!property || !property.tenant) return;
    const t = property.tenant;

    const shareData = {
      title: `Thông tin khách thuê: ${t.name}`,
      text: `HỒ SƠ KHÁCH THUÊ - ${property.name}\n\n` +
            `- Họ tên: ${t.name}\n` +
            `- Loại khách: ${t.isForeigner ? 'Người nước ngoài' : 'Việt Nam'}\n` +
            `- Ngày Check-in: ${t.checkInDate}\n` +
            `- Hết hạn HĐ: ${t.contractExpiryDate}\n` +
            `- Giá thuê: ${t.rentAmount.toLocaleString()}đ\n\n` +
            `Quản lý bởi RentMaster Pro.`,
    };

    const filesToShare: File[] = [];
    
    const base64ToFile = (base64: string, filename: string) => {
      const arr = base64.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      return new File([u8arr], filename, { type: mime });
    };

    try {
      if (t.idCardUrl) filesToShare.push(base64ToFile(t.idCardUrl, 'cccd_khach.jpg'));
      if (t.passportUrl) filesToShare.push(base64ToFile(t.passportUrl, 'passport.jpg'));
      if (t.visaUrl) filesToShare.push(base64ToFile(t.visaUrl, 'visa.jpg'));

      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        await navigator.share({
          ...shareData,
          files: filesToShare
        });
      } else {
        await navigator.share(shareData);
      }
    } catch (err) {
      console.log('Sharing failed', err);
    }
  };

  const saveQuickUpdate = async () => {
    if (!property) return;
    
    // Nếu đổi sang Rented mà chưa có Tenant -> Báo lỗi cần vào Edit
    if (quickUpdateData.status === 'Rented' && !property.tenant) {
      alert("Căn hộ chưa có thông tin Khách Thuê. Vui lòng vào nút Chỉnh Sửa để thêm khách thuê trước!");
      return;
    }

    let updatedTenant = property.tenant;
    if (quickUpdateData.status === 'Rented' && updatedTenant) {
      if (!quickUpdateData.checkInDate || !quickUpdateData.contractExpiryDate) {
        alert("Vui lòng nhập ngày bắt đầu và kết thúc hợp đồng!");
        return;
      }
      updatedTenant = {
        ...updatedTenant,
        checkInDate: quickUpdateData.checkInDate,
        contractExpiryDate: quickUpdateData.contractExpiryDate
      };
    } else if (quickUpdateData.status === 'Available') {
       // Giữ nguyên tenant object nhưng status là Available, hoặc clear phần liên quan tuỳ logic
       // Tạm thời giữ nguyên tenant historical data, chỉ set status = Available.
    }

    const updatedProperty = {
      ...property,
      status: quickUpdateData.status,
      tenant: updatedTenant,
      rating: quickUpdateData.rating,
      propertyNotes: quickUpdateData.propertyNotes
    };

    const updatedProps = properties.map((p: Property) => p.id === id ? updatedProperty : p);
    await updateProperties(updatedProps);
    setProperty(updatedProperty);
    setShowQuickUpdate(false);
  };


  if (!property) return <div className="p-20 text-center font-black uppercase text-slate-300">Đang tải...</div>;

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center justify-center gap-1.5 py-2 px-1 flex-1 transition-all rounded-[14px] ${activeTab === id ? 'bg-white text-blue-600 shadow-[0_2px_10px_rgba(0,0,0,0.06)] font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
    >
      <Icon size={14} strokeWidth={activeTab === id ? 2.5 : 2} className="shrink-0" />
      <span className="text-[10.5px] leading-[1.15] text-left">{label}</span>
    </button>
  );

  return (
    <div className="bg-white min-h-full pb-24 transition-colors">
      <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-40 pt-1 pb-2 shadow-sm border-b border-slate-100 px-4">
        <div className="flex items-center gap-3 mt-1 mb-2">
          <button aria-label="Quay lại" title="Quay lại" onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-50 text-slate-500 rounded-[14px] flex items-center justify-center shrink-0 active:scale-90 transition-transform">
             <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-[13.5px] font-extrabold text-slate-900 capitalize tracking-tight truncate">{property.name.toLowerCase()}</h1>
          </div>
          
          <div className="flex gap-2 shrink-0">
             <button title="Chỉnh sửa" onClick={() => navigate(`/property/edit/${property.id}`)} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-[14px] flex items-center justify-center active:scale-90 transition-transform">
              <Edit3 size={16} strokeWidth={2.5} />
            </button>
            <button title="Xóa" onClick={handleDelete} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-[14px] flex items-center justify-center active:scale-90 transition-transform">
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="mt-1 bg-slate-100/80 rounded-[16px] p-1 flex items-stretch">
          <TabButton id="info" label="Tổng quan" icon={Info} />
          <TabButton id="media" label="Hình ảnh" icon={Images} />
          <TabButton id="tenant" label={<span>Khách<br/>thuê</span>} icon={User} />
          <TabButton id="payment" label={<span>Thanh<br/>toán</span>} icon={Wallet} />
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Main Info Bento Box */}
         <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex flex-col gap-4">
           {/* 1. Large Cover Image */}
           <div className="w-full h-[220px] rounded-[18px] overflow-hidden shadow-sm relative border border-slate-50 shrink-0">
             <img src={StorageService.getDisplayUrl(property.imageUrl)} className="w-full h-full object-cover" alt="" />
             <div className="absolute inset-x-0 bottom-0 pb-3 pt-12 bg-gradient-to-t from-[#0f172a]/95 to-transparent px-4 flex items-end">
               <span className="text-[11px] font-black text-white uppercase tracking-widest">{property.type === 'Apartment' ? 'Chung cư' : property.type === 'Hotel' ? 'Khách sạn' : 'Nhà phố'}</span>
             </div>
           </div>
           
           <div className="flex flex-col">
             {/* 2. Name & Address */}
             <div className="space-y-1">
               <h2 className="text-[18px] font-bold text-[#0f172a] capitalize tracking-tight leading-[1.3] line-clamp-2">{property.name.toLowerCase()}</h2>
               
               <div className="flex flex-col gap-1.5 mt-2">
                 <div className="flex items-center gap-1.5 text-slate-500">
                   <MapPin size={14} className="text-slate-400 shrink-0" />
                   <p className="text-[13px] font-medium truncate italic tracking-tight">{property.address || property.structure}</p>
                 </div>
                 
                 {property.tenant?.name && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                       <User size={14} className="text-indigo-400 shrink-0" />
                       <span className="text-[13px] font-bold text-[#1e293b] truncate">{property.tenant.name}</span>
                    </div>
                 )}
               </div>
             </div>

             {/* 3. Badges: Status & Level */}
             <div className="mt-4 flex flex-wrap gap-3 items-stretch">
               <div className={`flex-1 px-4 py-2.5 rounded-[14px] flex flex-col justify-center gap-1 border ${
                 property.status === 'Rented' ? 'bg-[#f0fdf4] text-emerald-700 border-emerald-100/50' : 
                 property.status === 'Sold' ? 'bg-[#fffbeb] text-amber-700 border-amber-200/50' :
                 'bg-slate-50 text-slate-500 border-slate-200/50'
               }`}>
                 <span className="text-[12px] font-black uppercase tracking-wider leading-none">{property.status === 'Rented' ? 'Đã Thuê' : property.status === 'Sold' ? 'Đã Bán' : 'Trống'}</span>
                 {property.status === 'Rented' && property.tenant?.contractExpiryDate && (
                   <span className="text-[10px] font-bold opacity-75 uppercase tracking-tight leading-none mt-0.5">Hạn: {property.tenant.contractExpiryDate}</span>
                 )}
               </div>
               
               <div className="px-5 py-2.5 rounded-[14px] bg-[#fffbeb] text-amber-600 border border-amber-100/50 flex flex-col items-center justify-center min-w-[30%]">
                 <span className="text-[10px] font-black uppercase opacity-60 tracking-widest leading-none mb-1">Level</span>
                 <div className="flex items-center gap-1">
                    <span className="text-[17px] font-black tracking-tight leading-none">{property.rating ?? 10}</span>
                    <Star size={13} fill="currentColor" />
                 </div>
               </div>
             </div>

             {/* 4. Full Width Quick Update Button */}
             <div className="mt-3">
               <button onClick={() => setShowQuickUpdate(true)} className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-blue-600 bg-[#eff6ff] px-4 py-3.5 rounded-[14px] active:scale-95 transition-transform outline-none border border-blue-100/50 shadow-sm">
                  <Flashlight size={15} strokeWidth={2.5} />
                  <span>Sửa thông tin nhanh</span>
               </button>
             </div>
           </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        {activeTab === 'info' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            {(property.propertyNotes && property.propertyNotes.trim().length > 0) && (
              <div className="bg-rose-50/80 p-3 rounded-[14px] border border-rose-100 relative overflow-hidden mb-3">
                 <AlertTriangle size={80} className="absolute -right-4 -bottom-4 opacity-5 text-rose-600" />
                 <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 relative z-10"><AlertTriangle size={14}/> Sự cố / Lưu ý</h3>
                 <p className="text-[11px] text-rose-900/90 font-medium leading-relaxed whitespace-pre-line relative z-10 line-clamp-3">{property.propertyNotes}</p>
              </div>
            )}
            
            <div className="bg-slate-50/80 p-3 rounded-[14px] border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><FileText size={12}/> Mô tả</h3>
                <button 
                  onClick={handleCopyDetails} 
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-1.5 rounded-[8px] active:scale-95 transition-transform"
                >
                  <Copy size={12} /> Sao chép
                </button>
              </div>
              <p className="text-[11px] text-slate-700 font-medium leading-relaxed whitespace-pre-line">{property.description || "Chưa có mô tả"}</p>
            </div>
            
            <div className="bg-slate-50/80 p-3.5 rounded-[16px] border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Zap size={12}/> Công cụ thanh toán nhanh</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {property.utilities.electricityLink && (
                  <a href={property.utilities.electricityLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 bg-white rounded-[12px] border border-blue-50 hover:border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-[8px] flex items-center justify-center shrink-0"><ExternalLink size={12}/></div>
                      <span className="text-[12px] font-bold text-slate-700">Thanh toán Điện (EVN)</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{property.utilities.electricityCode}</span>
                  </a>
                )}
                {property.utilities.waterLink && (
                  <a href={property.utilities.waterLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 bg-white rounded-[12px] border border-cyan-50 hover:border-cyan-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-cyan-50 text-cyan-600 rounded-[8px] flex items-center justify-center shrink-0"><ExternalLink size={12}/></div>
                      <span className="text-[12px] font-bold text-slate-700">Thanh toán Nước</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{property.utilities.waterCode}</span>
                  </a>
                )}
                {property.utilities.wifiLink && (
                  <a href={property.utilities.wifiLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 bg-white rounded-[12px] border border-indigo-50 hover:border-indigo-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-[8px] flex items-center justify-center shrink-0"><ExternalLink size={12}/></div>
                      <span className="text-[12px] font-bold text-slate-700">Thanh toán Wifi</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{property.utilities.wifiCode}</span>
                  </a>
                )}
                {(!property.utilities.electricityLink && !property.utilities.waterLink && !property.utilities.wifiLink) && (
                   <p className="text-[11px] font-medium text-slate-400 italic text-center py-2">Chưa cài đặt liên kết thanh toán nào.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-slate-50/80 p-3.5 rounded-[16px] border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><ImageIcon size={12} /> Bộ sưu tập ảnh ({1 + (property.gallery?.length || 0)})</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative aspect-square bg-slate-100 rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] group border border-slate-200">
                  <img src={StorageService.getDisplayUrl(property.imageUrl)} className="w-full h-full object-cover" alt="Hình chính" />
                  <button 
                    title="Tải ảnh chính"
                    onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(property.imageUrl), `prop_${property.id}_main.jpg`)}
                    className="absolute bottom-1 right-1 p-1.5 bg-white/95 rounded-[8px] text-blue-600 shadow-sm active:scale-90 transition-all"
                  >
                    <Download size={14} strokeWidth={2.5}/>
                  </button>
                </div>
                {property.gallery?.map((uri, idx) => (
                  <div key={idx} className="relative aspect-square bg-slate-100 rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] group border border-slate-200">
                    <img src={StorageService.getDisplayUrl(uri)} className="w-full h-full object-cover" alt={`Hình phụ ${idx + 1}`} />
                    <button 
                      title="Tải ảnh phụ"
                      onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(uri), `prop_${property.id}_gallery_${idx}.jpg`)}
                      className="absolute bottom-1 right-1 p-1.5 bg-white/95 rounded-[8px] text-blue-600 shadow-sm active:scale-90 transition-all"
                    >
                      <Download size={14} strokeWidth={2.5}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {property.videos && property.videos.length > 0 && (
              <div className="bg-slate-50/80 p-3.5 rounded-[16px] border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><VideoIcon size={12} /> Video thực tế ({property.videos.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {property.videos.map((v, i) => (
                    <div key={i} className="relative aspect-video bg-slate-100 rounded-[12px] overflow-hidden border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                      <video src={StorageService.getDisplayUrl(v)} className="w-full h-full object-cover" controls playsInline />
                      <button 
                        title="Tải video"
                        onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(v), `prop_${property.id}_video_${i}.mp4`)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-white/95 text-blue-600 rounded-[8px] shadow-sm border border-slate-100 active:scale-90"
                      >
                        <Download size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tenant' && (
          <div className="space-y-3 animate-in fade-in">
            {property.tenant ? (
              <>
                <div className="bg-slate-50/80 p-3 rounded-[14px] border border-slate-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 text-blue-600 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm"><User size={16} /></div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Đại diện thuê</p>
                      <h4 className="text-[12px] font-bold text-slate-800 leading-none">{property.tenant.name}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {property.tenant.isForeigner && <span className="text-[7.5px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-[4px] font-black uppercase inline-block tracking-widest">Khách QT</span>}
                        {property.tenant.isForeigner && property.tenant.visaExpiryDate && <span className="text-[7.5px] px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100/50 rounded-[4px] font-black uppercase inline-block tracking-widest">Visa: {property.tenant.visaExpiryDate}</span>}
                      </div>
                    </div>
                  </div>
                  <button title="Chia sẻ thông tin khách thuê" onClick={handleShareTenant} className="w-8 h-8 bg-white border border-slate-200 text-slate-500 rounded-[10px] flex items-center justify-center active:scale-95 shadow-sm transition-transform hover:bg-slate-50">
                    <Share2 size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-[12px] shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-0.5">Nhận phòng</p>
                    <p className="text-[11px] font-bold text-slate-700">{property.tenant.checkInDate}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-[12px] shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-0.5">Hết hạn HĐ</p>
                    <p className="text-[11px] font-bold text-rose-600">{property.tenant.contractExpiryDate}</p>
                  </div>
                </div>

                {/* HỒ SƠ PHÁP LÝ & LƯU TRÚ */}
                <div className="bg-slate-50/80 p-3.5 rounded-[16px] border border-slate-100 flex flex-col shadow-sm mt-3">
                   <h5 className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5 mb-3"><ShieldCheck size={14} className="text-slate-400"/> Hồ sơ Pháp lý & Lưu trú</h5>
                   <div className="grid grid-cols-2 gap-2.5">
                     
                     {/* CMND/CCCD */}
                     {property.tenant.idCardUrl && (
                        <div className="relative aspect-[4/3] bg-white rounded-[12px] border border-slate-200 overflow-hidden shadow-sm group">
                            <span className="absolute top-1.5 left-1.5 z-10 text-[8px] font-black uppercase text-white bg-slate-900/60 backdrop-blur-md px-1.5 py-0.5 rounded-[4px] tracking-widest">CCCD</span>
                            <img alt="CCCD" src={StorageService.getDisplayUrl(property.tenant.idCardUrl)} className="w-full h-full object-cover" />
                            <button title="Tải CCCD" onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(property.tenant.idCardUrl!), `idcard.jpg`)} className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Download size={20} className="text-white"/></button>
                        </div>
                     )}

                     {/* Passport */}
                     {property.tenant.passportUrl && (
                        <div className="relative aspect-[4/3] bg-white rounded-[12px] border border-slate-200 overflow-hidden shadow-sm group">
                            <span className="absolute top-1.5 left-1.5 z-10 text-[8px] font-black uppercase text-white bg-amber-600/90 backdrop-blur-md px-1.5 py-0.5 rounded-[4px] tracking-widest">Passport</span>
                            <img alt="Passport" src={StorageService.getDisplayUrl(property.tenant.passportUrl)} className="w-full h-full object-cover" />
                            <button title="Tải Passport" onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(property.tenant.passportUrl!), `passport.jpg`)} className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Download size={20} className="text-white"/></button>
                        </div>
                     )}

                     {/* Visa */}
                     {property.tenant.visaUrl && (
                        <div className="relative aspect-[4/3] bg-white rounded-[12px] border border-slate-200 overflow-hidden shadow-sm group">
                            <span className="absolute top-1.5 left-1.5 z-10 text-[8px] font-black uppercase text-white bg-blue-600/90 backdrop-blur-md px-1.5 py-0.5 rounded-[4px] tracking-widest">Visa</span>
                            <img alt="Visa" src={StorageService.getDisplayUrl(property.tenant.visaUrl)} className="w-full h-full object-cover" />
                            <button title="Tải Visa" onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(property.tenant.visaUrl!), `visa.jpg`)} className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Download size={20} className="text-white"/></button>
                        </div>
                     )}
                     
                     {/* Đăng ký lưu trú */}
                     {property.tenant.residencyRegistrationUrl && (
                        <div className="relative aspect-[4/3] bg-white rounded-[12px] border border-slate-200 overflow-hidden shadow-sm group">
                            <span className="absolute top-1.5 left-1.5 z-10 text-[8px] font-black uppercase text-white bg-emerald-600/90 backdrop-blur-md px-1.5 py-0.5 rounded-[4px] tracking-widest">Lưu trú</span>
                            <img alt="Lưu trú" src={StorageService.getDisplayUrl(property.tenant.residencyRegistrationUrl)} className="w-full h-full object-cover" />
                            <button title="Tải Giấy lưu trú" onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(property.tenant.residencyRegistrationUrl!), `residency.jpg`)} className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Download size={20} className="text-white"/></button>
                        </div>
                     )}
                   </div>
                   
                   {/* Hợp đồng Layout ngang */}
                   {property.tenant.contractImages && property.tenant.contractImages.length > 0 && (
                     <div className="mt-3.5 pt-3.5 border-t border-slate-200/60">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5"><ImageIcon size={12}/> Hình hợp đồng ({property.tenant.contractImages.length})</p>
                         <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x scrollbar-hide">
                            {property.tenant.contractImages.map((img, idx) => (
                              <div key={idx} className="relative w-[75px] shrink-0 aspect-[3/4] bg-white rounded-[10px] border border-slate-200 overflow-hidden shadow-sm group snap-start">
                                <img alt="Hợp đồng" src={StorageService.getDisplayUrl(img)} className="w-full h-full object-cover" />
                                <button title="Tải hợp đồng" onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(img), `contract_${idx}.jpg`)} className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Download size={16} className="text-white" strokeWidth={2.5}/>
                                </button>
                              </div>
                            ))}
                         </div>
                     </div>
                   )}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 font-bold uppercase text-[11px] tracking-widest bg-slate-50/50 rounded-[20px] border border-slate-100 border-dashed">Phòng trống</div>
            )}
          </div>
        )}

        {activeTab === 'payment' && property.tenant && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-[#1e293b] rounded-[20px] p-5 text-white shadow-[0_8px_30px_rgba(30,41,59,0.2)] relative overflow-hidden border border-slate-700/80">
               <Wallet size={120} className="absolute -right-6 -bottom-8 opacity-[0.03] rotate-12" />
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 drop-shadow-sm">Giá thuê hằng tháng</p>
               <h3 className="text-[22px] font-black my-1 tracking-tight drop-shadow-md">{(property.tenant.rentAmount).toLocaleString()} <span className="underline decoration-[1.5px] underline-offset-2">đ</span></h3>
               <div className="mt-4 p-2.5 bg-white/[0.03] rounded-[12px] border border-white/5 backdrop-blur-sm">
                 <p className="text-[8.5px] font-black text-slate-300 uppercase tracking-widest mb-2 ml-1">Đã thu tháng này</p>
                 <div className="flex gap-2">
                   <button onClick={() => togglePaymentStatus('rent')} className={`flex-1 py-2 rounded-[10px] text-[9px] font-black uppercase tracking-widest transition-all border ${property.tenant.isRentPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-700/80'}`}>Tiền nhà</button>
                   <button onClick={() => togglePaymentStatus('utilities')} className={`flex-1 py-2 rounded-[10px] text-[9px] font-black uppercase tracking-widest transition-all border ${property.tenant.isUtilitiesPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-700/80'}`}>Dịch vụ</button>
                 </div>
               </div>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-[16px] border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-1.5"><Calendar size={13}/> Định kỳ thu</h4>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { label: 'Tiền nhà', day: property.tenant.rentPaymentDay, icon: Home, color: 'text-blue-500 bg-blue-50' },
                  { label: 'Tiền điện', day: property.tenant.electricityPaymentDay, icon: Zap, color: 'text-amber-500 bg-amber-50' },
                  { label: 'Tiền nước', day: property.tenant.waterPaymentDay, icon: Clock, color: 'text-cyan-500 bg-cyan-50' },
                  { label: 'Internet', day: property.tenant.wifiPaymentDay, icon: LinkIcon, color: 'text-indigo-500 bg-indigo-50' },
                  { label: 'Quản lý', day: property.tenant.managementPaymentDay, icon: ShieldCheck, color: 'text-slate-500 bg-slate-100' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-[14px] border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${item.color}`}><item.icon size={15} strokeWidth={2.5}/></div>
                      <span className="text-[11px] font-black text-slate-800 uppercase">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-[8px]">Ngày {item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showQuickUpdate && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowQuickUpdate(false)}></div>
          <div className="bg-white rounded-t-[32px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl relative z-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Flashlight size={16} className="text-blue-600"/> Cập nhật nhanh</h3>
              <button title="Đóng" onClick={() => setShowQuickUpdate(false)} className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center active:scale-95"><X size={16}/></button>
            </div>

            <div className="space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar px-1 pb-4">
              
              {/* STATUS */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TRẠNG THÁI & HỢP ĐỒNG</label>
                <div className="flex bg-slate-100 p-1 rounded-[16px]">
                  {(['Available', 'Rented', 'Sold'] as const).map(s => (
                    <button 
                      key={s}
                      onClick={() => setQuickUpdateData({...quickUpdateData, status: s})}
                      className={`flex-1 py-3 rounded-[12px] text-[11px] font-black uppercase tracking-widest transition-all ${
                        quickUpdateData.status === s 
                          ? (s === 'Rented' ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100/50' 
                             : s === 'Sold' ? 'bg-amber-50 text-amber-600 shadow-sm border border-amber-100/50' 
                             : 'bg-white text-slate-800 shadow-sm') 
                          : 'text-slate-400'
                      }`}
                    >
                      {s === 'Rented' ? 'Đã Thuê' : s === 'Available' ? 'Trống' : 'Đã bán'}
                    </button>
                  ))}
                </div>
              </div>

              {quickUpdateData.status === 'Rented' && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-slate-50 p-3 rounded-[16px] border border-slate-100">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">N. Bắt đầu</label>
                     <input title="Ngày bắt đầu" type="date" value={quickUpdateData.checkInDate} onChange={(e) => setQuickUpdateData({...quickUpdateData, checkInDate: e.target.value})} className="w-full bg-transparent text-[12px] font-bold text-slate-700 outline-none" />
                  </div>
                  <div className="bg-rose-50/50 p-3 rounded-[16px] border border-rose-100/50">
                     <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-1.5">N. Hết Hạn</label>
                     <input title="Ngày kết thúc" type="date" value={quickUpdateData.contractExpiryDate} onChange={(e) => setQuickUpdateData({...quickUpdateData, contractExpiryDate: e.target.value})} className="w-full bg-transparent text-[12px] font-bold text-rose-700 outline-none" />
                  </div>
                </div>
              )}

              {/* RATING */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-[20px] border border-slate-100 mt-2">
                 <div className="flex justify-between items-center mb-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Star size={12}/> Đánh giá nhà</label>
                   <span className="text-[14px] font-black text-amber-500">LV.{quickUpdateData.rating}</span>
                 </div>
                 <input 
                   title="Đánh giá chất lượng (1-10)"
                   type="range" 
                   min="1" max="10" 
                   value={quickUpdateData.rating} 
                   onChange={(e) => setQuickUpdateData({...quickUpdateData, rating: parseInt(e.target.value)})}
                   className="w-full appearance-none bg-slate-200 h-2 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                 />
                 <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                    <span>Trầm trọng</span>
                    <span>Hoàn hảo</span>
                 </div>
              </div>

              {/* NOTES */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><AlertTriangle size={12} /> Ghi chú tình trạng / sửa chữa</label>
                 <textarea 
                   placeholder="Vd: Ngày sửa ống nước, mất điện, pháp lý tranh chấp..."
                   value={quickUpdateData.propertyNotes}
                   onChange={e => setQuickUpdateData({...quickUpdateData, propertyNotes: e.target.value})}
                   className="w-full h-28 bg-rose-50/30 border border-slate-200 rounded-[20px] p-4 text-[12px] font-medium text-slate-700 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-100/50 transition-all placeholder:text-slate-400 resize-none"
                 />
              </div>

              <button 
                onClick={saveQuickUpdate}
                className="w-full py-4 bg-blue-600 text-white rounded-[16px] text-xs font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
              >
                 <Save size={16} /> Lưu cập nhật
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
