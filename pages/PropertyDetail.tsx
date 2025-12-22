
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, User, MapPin, Info, 
  Images, CreditCard, Share2, Copy, Download,
  Play, Video as VideoIcon, X, FileText, Wallet, Clock,
  Calendar, Globe, Link as LinkIcon, ExternalLink, ShieldCheck, CheckCircle,
  Home, Zap, Image as ImageIcon, Share, ClipboardCheck, Edit3, Trash2
} from 'lucide-react';
import { getStoredProperties, getStoredOwners, saveProperties } from '../data/mockData';
import { Property, Owner } from '../types';
import { StorageService } from '../services/StorageService';

const PropertyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'tenant' | 'payment'>('info');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const properties = await getStoredProperties();
      const owners = await getStoredOwners();
      const p = properties.find(p => p.id === id);
      if (p) {
        setProperty(p);
        setOwner(owners.find(o => o.id === p.ownerId) || null);
      }
    };
    loadData();
  }, [id]);

  const togglePaymentStatus = async (type: 'rent' | 'utilities') => {
    if (!property || !property.tenant) return;
    
    const updatedTenant = { ...property.tenant };
    if (type === 'rent') updatedTenant.isRentPaid = !updatedTenant.isRentPaid;
    if (type === 'utilities') updatedTenant.isUtilitiesPaid = !updatedTenant.isUtilitiesPaid;
    
    const props = await getStoredProperties();
    const updatedProps = props.map(p => p.id === id ? { ...p, tenant: updatedTenant } : p);
    await saveProperties(updatedProps);
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
      const props = await getStoredProperties();
      const updated = props.filter(p => p.id !== id);
      await saveProperties(updated);
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

  if (!property) return <div className="p-20 text-center font-black uppercase text-slate-300">Đang tải...</div>;

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center gap-1 py-3 flex-1 transition-all relative ${activeTab === id ? 'text-blue-600' : 'text-slate-300 dark:text-slate-600'}`}
    >
      <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span className="text-[10px] font-bold">{label}</span>
      {activeTab === id && <div className="absolute bottom-0 w-6 h-0.5 bg-blue-600 rounded-full"></div>}
    </button>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-full pb-24 transition-colors">
      <div className="relative h-72 overflow-hidden rounded-b-[2.5rem] shadow-lg">
        <img src={StorageService.getDisplayUrl(property.imageUrl)} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
        <button onClick={() => navigate(-1)} className="absolute top-5 left-5 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center border border-white/20 active:scale-90">
          <ArrowLeft size={18} />
        </button>
        <div className="absolute top-5 right-5 flex gap-2">
           <button onClick={() => navigate(`/property/edit/${property.id}`)} className="w-10 h-10 bg-white/10 backdrop-blur-md text-white rounded-xl flex items-center justify-center border border-white/20 active:scale-90">
            <Edit3 size={18} />
          </button>
          <button onClick={handleDelete} className="w-10 h-10 bg-rose-500/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center border border-rose-500/20 active:scale-90">
            <Trash2 size={18} />
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6 space-y-1">
          <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg">{property.type}</span>
          <h2 className="text-2xl font-black text-white italic truncate">{property.name}</h2>
          <p className="text-[10px] text-white/70 font-bold flex items-center gap-1"><MapPin size={10} /> {property.address}</p>
        </div>
      </div>

      <div className="mx-5 -mt-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-50 dark:border-slate-700 flex items-center p-1.5 z-30 relative">
        <TabButton id="info" label="Tổng quan" icon={Info} />
        <TabButton id="media" label="Hình ảnh" icon={Images} />
        <TabButton id="tenant" label="Khách thuê" icon={User} />
        <TabButton id="payment" label="Thanh toán" icon={Wallet} />
      </div>

      <div className="p-5">
        {activeTab === 'info' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả bất động sản</h3>
                <button 
                  onClick={handleCopyDetails} 
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                >
                  <Copy size={12} /> Sao chép
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed whitespace-pre-line">{property.description}</p>
              
              {property.assets && property.assets.length > 0 && (
                <div className="mt-5 pt-5 border-t border-slate-50 dark:border-slate-700">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Danh mục tài sản đính kèm</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {property.assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{asset.name}</span>
                        <span className="text-[10px] font-black text-blue-600">{asset.quantity} {asset.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiện ích thanh toán nhanh</h3>
              <div className="grid grid-cols-1 gap-3">
                {property.utilities.electricityLink && (
                  <a href={property.utilities.electricityLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center"><ExternalLink size={14}/></div>
                      <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400">Thanh toán Điện (EVN)</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{property.utilities.electricityCode}</span>
                  </a>
                )}
                {property.utilities.waterLink && (
                  <a href={property.utilities.waterLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl border border-cyan-100 dark:border-cyan-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-600 text-white rounded-lg flex items-center justify-center"><ExternalLink size={14}/></div>
                      <span className="text-[10px] font-black uppercase text-cyan-700 dark:text-cyan-400">Thanh toán Nước</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{property.utilities.waterCode}</span>
                  </a>
                )}
                {property.utilities.wifiLink && (
                  <a href={property.utilities.wifiLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center"><ExternalLink size={14}/></div>
                      <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400">Thanh toán Wifi</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{property.utilities.wifiCode}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                <ImageIcon size={14} /> Bộ sưu tập hình ảnh
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-square bg-slate-200 rounded-3xl overflow-hidden shadow-sm group">
                  <img src={StorageService.getDisplayUrl(property.imageUrl)} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(property.imageUrl), `prop_${property.id}_main.jpg`)}
                    className="absolute bottom-2 right-2 p-2.5 bg-white/90 rounded-xl text-blue-600 shadow-lg active:scale-90 transition-all"
                    title="Lưu về máy"
                  >
                    <Download size={18} strokeWidth={2.5}/>
                  </button>
                </div>
                {property.gallery?.map((uri, idx) => (
                  <div key={idx} className="relative aspect-square bg-slate-200 rounded-3xl overflow-hidden shadow-sm group">
                    <img src={StorageService.getDisplayUrl(uri)} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(uri), `prop_${property.id}_gallery_${idx}.jpg`)}
                      className="absolute bottom-2 right-2 p-2.5 bg-white/90 rounded-xl text-blue-600 shadow-lg active:scale-90 transition-all"
                      title="Lưu về máy"
                    >
                      <Download size={18} strokeWidth={2.5}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {property.videos && property.videos.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                  <VideoIcon size={14} /> Video thực tế
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {property.videos.map((v, i) => (
                    <div key={i} className="relative aspect-video bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-lg">
                      <video 
                        src={StorageService.getDisplayUrl(v)} 
                        className="w-full h-full object-cover" 
                        controls 
                      />
                      <button 
                        onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(v), `prop_${property.id}_video_${i}.mp4`)}
                        className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md text-white rounded-xl border border-white/20 active:scale-90"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tenant' && (
          <div className="space-y-4 animate-in fade-in">
            {property.tenant ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><User size={30} /></div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Khách đang thuê</p>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic">{property.tenant.name}</h4>
                      {property.tenant.isForeigner && <span className="text-[8px] px-2 py-0.5 bg-amber-500 text-white rounded-lg font-black uppercase">Khách nước ngoài</span>}
                    </div>
                    <button 
                      onClick={handleShareTenant}
                      className="w-10 h-10 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center active:scale-90"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Ngày nhận phòng</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{property.tenant.checkInDate}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Ngày hết hợp đồng</p>
                      <p className="text-xs font-black text-rose-500">{property.tenant.contractExpiryDate}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14}/> Hình ảnh hợp đồng thuê</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {property.tenant.contractImages?.map((img, idx) => (
                        <div key={idx} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-100 group">
                          <img src={StorageService.getDisplayUrl(img)} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(img), `contract_${idx}.jpg`)}
                            className="absolute bottom-1 right-1 p-1.5 bg-white/90 rounded-lg text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Download size={12}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {property.tenant.isForeigner && property.tenant.visaExpiryDate && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-[2rem] border border-amber-100 dark:border-amber-800/50">
                    <h5 className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase flex items-center gap-2 mb-2"><Globe size={14}/> Thông tin Visa</h5>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">Hết hạn vào: {property.tenant.visaExpiryDate}</span>
                    </div>
                    {property.tenant.visaUrl && (
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-white shadow-md group">
                        <img src={StorageService.getDisplayUrl(property.tenant.visaUrl)} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(property.tenant.visaUrl), 'visa_client.jpg')}
                          className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-xl text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={16}/>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {property.tenant.residencyRegistrationUrl && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50">
                    <h5 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-2 mb-3"><ShieldCheck size={14}/> Đăng ký lưu trú</h5>
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-white shadow-md group">
                      <img src={StorageService.getDisplayUrl(property.tenant.residencyRegistrationUrl)} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleDownloadMedia(StorageService.getDisplayUrl(property.tenant.residencyRegistrationUrl), 'luu_tru.jpg')}
                        className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-xl text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download size={16}/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 font-black uppercase">Phòng hiện đang trống</div>
            )}
          </div>
        )}

        {activeTab === 'payment' && property.tenant && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
               <Wallet size={120} className="absolute -right-8 -bottom-8 opacity-5 rotate-12" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá thuê hàng tháng</p>
               <h3 className="text-3xl font-black italic mt-1">{property.tenant.rentAmount.toLocaleString()}đ</h3>
               <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10">
                 <p className="text-[10px] font-bold text-white/60">Tình trạng thanh toán tháng này</p>
                 <div className="flex gap-2 mt-3">
                   <button onClick={() => togglePaymentStatus('rent')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${property.tenant.isRentPaid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40' : 'bg-white/20 text-white/50'}`}>Tiền nhà</button>
                   <button onClick={() => togglePaymentStatus('utilities')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${property.tenant.isUtilitiesPaid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40' : 'bg-white/20 text-white/50'}`}>Dịch vụ</button>
                 </div>
               </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lịch thu phí hàng tháng</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Tiền nhà', day: property.tenant.rentPaymentDay, icon: Home, color: 'text-blue-500' },
                  { label: 'Tiền điện', day: property.tenant.electricityPaymentDay, icon: Zap, color: 'text-amber-500' },
                  { label: 'Tiền nước', day: property.tenant.waterPaymentDay, icon: Clock, color: 'text-cyan-500' },
                  { label: 'Internet', day: property.tenant.wifiPaymentDay, icon: LinkIcon, color: 'text-indigo-500' },
                  { label: 'Phí quản lý', day: property.tenant.managementPaymentDay, icon: ShieldCheck, color: 'text-slate-500' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-slate-50 dark:bg-slate-700 rounded-xl ${item.color}`}><item.icon size={16}/></div>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-blue-600">Ngày {item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
