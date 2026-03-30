
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Building2, User, 
  FileText, CheckCircle, Home, Hotel, MapPin, 
  Phone, Hash, Info, ChevronRight, Sparkles, X, Copy,
  Calendar, CreditCard, Link as LinkIcon, Globe, ShieldCheck, Image as ImageIcon,
  Users, UserPlus, Check, Trash2, Plus, Bell, RefreshCcw, Zap
} from 'lucide-react';
import PhotoPicker from '../components/PhotoPicker';
import { Property, Owner, Tenant, FamilyMember } from '../types';
import { StorageService } from '../services/StorageService';
import { AppwriteService } from '../services/AppwriteService';
import { useAppContext } from '../data/AppContext';

const PropertyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { properties, owners, updateProperties, updateOwners } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [ownerMode, setOwnerMode] = useState<'existing' | 'new'>('new');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const initialFormData = {
    // Bước 1: Bất động sản
    name: '',
    type: 'Apartment' as Property['type'],
    address: '',
    description: '',
    images: [] as string[],
    videos: [] as string[],
    
    // Bước 2: Chủ nhà (Nếu thêm mới)
    ownerName: '',
    ownerPhones: [''],
    ownerAddress: '',
    ownerIdCardImages: [] as string[],
    
    // Bước 3: Dịch vụ & Tài chính
    electricityCode: '',
    electricityLink: '',
    ownerElectricityPaymentDay: 1,
    waterCode: '',
    waterLink: '',
    ownerWaterPaymentDay: 1,
    wifiCode: '',
    wifiLink: '',
    ownerWifiPaymentDay: 1,
    
    // Bước 4: Khách thuê & Hợp đồng
    status: 'Available' as Property['status'],
    hasTenant: false,
    tenantName: '',
    tenantIdCardImages: [] as string[],
    isForeigner: false,
    passportImages: [] as string[],
    visaImages: [] as string[],
    visaExpiryDate: '',
    visaReminderDays: 14, 
    checkInDate: '',
    contractExpiryDate: '',
    contractReminderDays: 30, 
    contractImages: [] as string[],
    residencyImages: [] as string[],
    familyMembers: [] as FamilyMember[],
    
    // Lịch thanh toán riêng biệt
    rentPaymentDay: 1,
    electricityPaymentDay: 1,
    waterPaymentDay: 1,
    wifiPaymentDay: 1,
    managementPaymentDay: 1,
    rentAmount: 0
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const loadData = () => {
      if (isEdit) {
        const p = properties.find((prop: Property) => prop.id === id);
        if (p) {
          setOwnerMode('existing');
          setSelectedOwnerId(p.ownerId);
          
          setFormData({
            ...initialFormData,
            name: p.name,
            type: p.type,
            address: p.address,
            description: p.description,
            images: [p.imageUrl, ...p.gallery].filter(Boolean),
            videos: p.videos || [],
            electricityCode: p.utilities?.electricityCode || '',
            electricityLink: p.utilities?.electricityLink || '',
            ownerElectricityPaymentDay: p.utilities?.electricityPaymentDay || 1,
            waterCode: p.utilities?.waterCode || '',
            waterLink: p.utilities?.waterLink || '',
            ownerWaterPaymentDay: p.utilities?.waterPaymentDay || 1,
            wifiCode: p.utilities?.wifiCode || '',
            wifiLink: p.utilities?.wifiLink || '',
            ownerWifiPaymentDay: p.utilities?.wifiPaymentDay || 1,
            status: p.status || (p.tenant ? 'Rented' : 'Available'),
            hasTenant: !!p.tenant,
            tenantName: p.tenant?.name || '',
            tenantIdCardImages: p.tenant?.idCardUrl ? [p.tenant.idCardUrl] : [],
            isForeigner: p.tenant?.isForeigner || false,
            passportImages: p.tenant?.passportUrl ? [p.tenant.passportUrl] : [],
            visaImages: p.tenant?.visaUrl ? [p.tenant.visaUrl] : [],
            visaExpiryDate: p.tenant?.visaExpiryDate || '',
            visaReminderDays: p.tenant?.visaReminderDays || 14,
            checkInDate: p.tenant?.checkInDate || '',
            contractExpiryDate: p.tenant?.contractExpiryDate || '',
            contractReminderDays: p.tenant?.contractReminderDays || 30,
            contractImages: p.tenant?.contractImages || [],
            residencyImages: p.tenant?.residencyRegistrationUrl ? [p.tenant.residencyRegistrationUrl] : [],
            familyMembers: p.tenant?.familyMembers || [],
            rentPaymentDay: p.tenant?.rentPaymentDay || 1,
            electricityPaymentDay: p.tenant?.electricityPaymentDay || 1,
            waterPaymentDay: p.tenant?.waterPaymentDay || 1,
            wifiPaymentDay: p.tenant?.wifiPaymentDay || 1,
            managementPaymentDay: p.tenant?.managementPaymentDay || 1,
            rentAmount: p.tenant?.rentAmount || 0
          });
        }
      } else if (owners.length > 0) {
        setOwnerMode('existing');
        setSelectedOwnerId(owners[0].id);
      }
    };
    loadData();
  }, [id, isEdit, properties, owners]);

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập trên form này?")) {
      setFormData(initialFormData);
      setStep(1);
      window.scrollTo(0, 0);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.name) return alert("Vui lòng nhập tên căn hộ!");
    if (step === 2) {
      if (ownerMode === 'existing' && !selectedOwnerId) return alert("Vui lòng chọn một chủ nhà!");
      if (ownerMode === 'new' && !formData.ownerName) return alert("Vui lòng nhập tên chủ nhà!");
    }
    if (step === 4 && formData.hasTenant) {
      if (!formData.tenantName) return alert("Vui lòng nhập tên khách thuê!");
      if (formData.residencyImages.length === 0) return alert("Bắt buộc phải có ảnh đăng ký lưu trú!");
      if (formData.contractImages.length === 0) return alert("Vui lòng tải lên hình ảnh hợp đồng thuê!");
    }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  };

  const persistMedia = async (data: string, prefix: string) => {
    if (!data || data.startsWith('file://') || data.startsWith('http')) return data;
    return await AppwriteService.uploadMedia(data, prefix);
  };

  const persistMediaArray = async (dataArr: string[], prefix: string) => {
    return await Promise.all(dataArr.map(item => persistMedia(item, prefix)));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    let ownerId = selectedOwnerId;

    try {
      // Persist all media from form before saving to JSON
      const persistedPropImages = await persistMediaArray(formData.images, 'prop');
      const persistedPropVideos = await persistMediaArray(formData.videos, 'prop-video');
      const persistedOwnerIDImages = await persistMediaArray(formData.ownerIdCardImages, 'owner-id');
      const persistedTenantIDImages = await persistMediaArray(formData.tenantIdCardImages, 'tenant-id');
      const persistedPassportImages = await persistMediaArray(formData.passportImages, 'passport');
      const persistedVisaImages = await persistMediaArray(formData.visaImages, 'visa');
      const persistedContractImages = await persistMediaArray(formData.contractImages, 'contract');
      const persistedResidencyImages = await persistMediaArray(formData.residencyImages, 'residency');

      if (ownerMode === 'new') {
        ownerId = 'o' + Date.now();
        const newOwner: Owner = {
          id: ownerId,
          name: formData.ownerName,
          phones: formData.ownerPhones,
          address: formData.ownerAddress,
          managementStartDate: new Date().toISOString(),
          avatarUrl: '', 
          idCardFront: persistedOwnerIDImages[0] || '',
          idCardBack: persistedOwnerIDImages[1] || ''
        };
        await updateOwners([...owners, newOwner]);
      }

      let tenant: Tenant | undefined = undefined;
      if (formData.hasTenant) {
        tenant = {
          id: 't' + Date.now(),
          name: formData.tenantName,
          idCardUrl: persistedTenantIDImages[0] || '',
          isForeigner: formData.isForeigner,
          passportUrl: persistedPassportImages[0] || '',
          visaUrl: persistedVisaImages[0] || '',
          visaExpiryDate: formData.visaExpiryDate,
          visaReminderDays: formData.visaReminderDays,
          checkInDate: formData.checkInDate || new Date().toISOString().split('T')[0],
          contractExpiryDate: formData.contractExpiryDate || '',
          contractReminderDays: formData.contractReminderDays,
          contractImages: persistedContractImages,
          residencyRegistrationUrl: persistedResidencyImages[0] || '',
          rentAmount: formData.rentAmount,
          rentPaymentDay: formData.rentPaymentDay,
          electricityPaymentDay: formData.electricityPaymentDay,
          waterPaymentDay: formData.waterPaymentDay,
          managementPaymentDay: formData.managementPaymentDay,
          wifiPaymentDay: formData.wifiPaymentDay,
          servicePaymentDay: formData.electricityPaymentDay,
          isRentPaid: false,
          isUtilitiesPaid: false,
          familyMembers: formData.familyMembers.length > 0 ? formData.familyMembers : undefined
        };
      }

      const newProp: Property = {
        id: isEdit ? id! : 'p' + Date.now(),
        name: formData.name,
        type: formData.type,
        address: formData.address,
        description: formData.description,
        structure: formData.address,
        imageUrl: persistedPropImages[0] || '',
        gallery: persistedPropImages.slice(1),
        videos: persistedPropVideos,
        ownerId: ownerId || '',
        status: formData.status,
        condition: 'Normal',
        totalAssetValue: 0,
        constructionYear: new Date().getFullYear(),
        operationStartDate: new Date().toISOString(),
        assets: [],
        tenant: tenant,
        utilities: {
          electricityCode: formData.electricityCode,
          electricityLink: formData.electricityLink,
          electricityPaymentDay: formData.ownerElectricityPaymentDay,
          waterCode: formData.waterCode,
          waterLink: formData.waterLink,
          waterPaymentDay: formData.ownerWaterPaymentDay,
          wifiCode: formData.wifiCode,
          wifiLink: formData.wifiLink,
          wifiPaymentDay: formData.ownerWifiPaymentDay
        }
      };
      
      const updatedProps = isEdit 
        ? properties.map(p => p.id === id ? newProp : p)
        : [...properties, newProp];

      await updateProperties(updatedProps);
      navigate(isEdit ? `/property/${id}` : '/properties');
    } catch (error) {
      console.error("Save error", error);
      alert("Đã có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-[14px] p-3 text-[13px] font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all mb-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-1.5";

  return (
    <div className="absolute inset-0 bg-white z-[100] flex flex-col font-sans overflow-hidden">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-[1000] bg-white/60 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Đang lưu hồ sơ...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl pt-safe pb-3 px-4 border-b border-slate-100 shadow-sm shrink-0 z-50 sticky top-0">
        <div className="flex items-center justify-between mb-3 pt-3">
          <button title="Quay lại" onClick={() => step > 1 ? prevStep() : navigate(-1)} className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-[10px] flex items-center justify-center text-slate-500 active:scale-90">
            <ArrowLeft size={16} />
          </button>
          <div className="text-center">
            <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{isEdit ? 'Sửa BĐS' : 'Hồ sơ BĐS'}</h2>
            <p className="text-[10px] font-bold text-blue-600">Bước {step} / 4</p>
          </div>
          <div className="flex items-center gap-1.5">
            {!isEdit && (
              <button title="Khôi phục mặc định" onClick={handleReset} className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-[10px] flex items-center justify-center text-slate-500 active:scale-90">
                <RefreshCcw size={14} />
              </button>
            )}
            <button title="Đóng" onClick={() => navigate(-1)} className="w-8 h-8 bg-rose-50 border border-rose-100 rounded-[10px] flex items-center justify-center text-rose-500 active:scale-90">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 px-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-32">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-6">
            <section>
              <label className={labelClass}><Building2 size={12}/> Tên căn hộ</label>
              <input className={inputClass} placeholder="Ví dụ: Landmark 81 - A.2001" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <label className={labelClass}><MapPin size={12}/> Địa chỉ thực tế</label>
              <input className={inputClass} placeholder="Số nhà, tên đường, quận..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <label className={labelClass}><FileText size={12}/> Mô tả kết cấu / Nội thất</label>
              <textarea className={`${inputClass} h-32`} placeholder="Diện tích, số phòng ngủ, danh sách nội thất chính..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </section>
            <PhotoPicker label="ẢNH THỰC TẾ (ẢNH ĐẦU LÀM ĐẠI DIỆN)" multiple images={formData.images} onChange={imgs => setFormData({...formData, images: imgs})} />
            <PhotoPicker label="VIDEO THỰC TẾ (QUAY THEO CHIỀU DỌC)" accept="video/*" multiple images={formData.videos} onChange={imgs => setFormData({...formData, videos: imgs})} />
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-4">
            <div className="flex p-0.5 bg-slate-100 rounded-[12px] mb-3 border border-slate-100">
              <button 
                onClick={() => setOwnerMode('existing')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[10px] font-black uppercase transition-all ${ownerMode === 'existing' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                <Users size={12} /> Chọn có sẵn
              </button>
              <button 
                onClick={() => setOwnerMode('new')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[10px] font-black uppercase transition-all ${ownerMode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                <UserPlus size={12} /> Thêm mới
              </button>
            </div>

            {ownerMode === 'existing' ? (
              <div className="space-y-2">
                {owners.length > 0 ? (
                  owners.map(owner => (
                    <button 
                      key={owner.id}
                      onClick={() => setSelectedOwnerId(owner.id)}
                      className={`w-full p-3 rounded-[16px] border-2 text-left flex items-center justify-between transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${selectedOwnerId === owner.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-slate-50/80'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          {owner.avatarUrl ? (
                            <img src={StorageService.getDisplayUrl(owner.avatarUrl)} className="w-full h-full object-cover" alt={owner.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20} /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 uppercase">{owner.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{owner.phones[0]}</p>
                        </div>
                      </div>
                      {selectedOwnerId === owner.id && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm"><Check size={12} /></div>}
                    </button>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-300 font-black uppercase text-xs border-2 border-dashed border-slate-200 rounded-3xl">
                    Chưa có danh sách chủ nhà
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <section>
                  <label className={labelClass}><User size={12}/> Họ tên chủ nhà (Trên CCCD)</label>
                  <input className={inputClass} placeholder="Nguyễn Văn A" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                  <label className={labelClass}><Phone size={12}/> Số điện thoại liên hệ</label>
                  <input className={inputClass} placeholder="090..." value={formData.ownerPhones[0]} onChange={e => setFormData({...formData, ownerPhones: [e.target.value]})} />
                  <label className={labelClass}><MapPin size={12}/> Địa chỉ chủ nhà</label>
                  <input className={inputClass} placeholder="Số nhà, Phường, Quận..." value={formData.ownerAddress} onChange={e => setFormData({...formData, ownerAddress: e.target.value})} />
                </section>
                <PhotoPicker label="ẢNH CCCD CHỦ NHÀ" multiple images={formData.ownerIdCardImages} onChange={imgs => setFormData({...formData, ownerIdCardImages: imgs})} />
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-4">
            <div className="bg-blue-600 rounded-[20px] p-4 text-white shadow-md mb-2">
              <h3 className="font-black uppercase italic text-[12px] flex items-center gap-1.5"><CreditCard size={16}/> Dịch vụ & Liên kết</h3>
              <p className="text-[9px] opacity-80 mt-1 font-bold">Lưu thông tin thanh toán cho khách trọ.</p>
            </div>
            
            <section className="space-y-3">
              <div className="p-3.5 bg-slate-50/80 rounded-[16px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <label className={labelClass}><Zap size={10}/> Điện (Mã KH & Link)</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input className={`${inputClass} !mb-0`} placeholder="Mã KH Điện..." value={formData.electricityCode} onChange={e => setFormData({...formData, electricityCode: e.target.value})} />
                  <div className="flex bg-white border border-slate-200 rounded-[14px] items-center px-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    <span className="text-[10px] font-bold text-slate-400 mr-2 whitespace-nowrap">Chốt ngày</span>
                    <input title="Ngày chốt điện" type="number" min="1" max="31" className="bg-transparent border-none outline-none text-[12px] font-bold text-blue-600 w-full" value={formData.ownerElectricityPaymentDay} onChange={(e) => setFormData({...formData, ownerElectricityPaymentDay: parseInt(e.target.value) || 1})} />
                  </div>
                </div>
                <input className={`${inputClass} !mb-0`} placeholder="Link thanh toán..." value={formData.electricityLink} onChange={e => setFormData({...formData, electricityLink: e.target.value})} />
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-[16px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <label className={labelClass}><Globe size={10}/> Nước (Mã KH & Link)</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input className={`${inputClass} !mb-0`} placeholder="Mã KH Nước..." value={formData.waterCode} onChange={e => setFormData({...formData, waterCode: e.target.value})} />
                  <div className="flex bg-white border border-slate-200 rounded-[14px] items-center px-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    <span className="text-[10px] font-bold text-slate-400 mr-2 whitespace-nowrap">Chốt ngày</span>
                    <input title="Ngày chốt nước" type="number" min="1" max="31" className="bg-transparent border-none outline-none text-[12px] font-bold text-blue-600 w-full" value={formData.ownerWaterPaymentDay} onChange={(e) => setFormData({...formData, ownerWaterPaymentDay: parseInt(e.target.value) || 1})} />
                  </div>
                </div>
                <input className={`${inputClass} !mb-0`} placeholder="Link thanh toán..." value={formData.waterLink} onChange={e => setFormData({...formData, waterLink: e.target.value})} />
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-[16px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <label className={labelClass}><LinkIcon size={10}/> Internet (Mã thuê bao & Link)</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input className={`${inputClass} !mb-0`} placeholder="Mã thuê bao wifi..." value={formData.wifiCode} onChange={e => setFormData({...formData, wifiCode: e.target.value})} />
                  <div className="flex bg-white border border-slate-200 rounded-[14px] items-center px-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    <span className="text-[10px] font-bold text-slate-400 mr-2 whitespace-nowrap">Chốt ngày</span>
                    <input title="Ngày chốt Internet" type="number" min="1" max="31" className="bg-transparent border-none outline-none text-[12px] font-bold text-blue-600 w-full" value={formData.ownerWifiPaymentDay} onChange={(e) => setFormData({...formData, ownerWifiPaymentDay: parseInt(e.target.value) || 1})} />
                  </div>
                </div>
                <input className={`${inputClass} !mb-0`} placeholder="Link thanh toán cước..." value={formData.wifiLink} onChange={e => setFormData({...formData, wifiLink: e.target.value})} />
              </div>
            </section>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-6">
            <div className="space-y-2.5">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1.5"><Building2 size={12} className="text-blue-500"/> Trạng thái Bất động sản</label>
               <div className="flex bg-slate-100/80 p-1.5 rounded-[16px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                 {(['Available', 'Rented', 'Sold'] as const).map(s => (
                   <button
                     key={s}
                     onClick={() => setFormData({...formData, status: s, hasTenant: s === 'Rented'})}
                     className={`flex-1 py-3 px-2 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${formData.status === s ? 
                       (s === 'Rented' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 
                        s === 'Sold' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 
                        'bg-white text-slate-700 shadow-sm border border-slate-200/50') : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     {s === 'Rented' ? <><User size={14}/> Đã thuê</> : s === 'Available' ? <><Home size={14}/> Trống</> : <><Sparkles size={14}/> Đã bán</>}
                   </button>
                 ))}
               </div>
            </div>

            {formData.hasTenant && (
              <div className="space-y-6 animate-in zoom-in-95">
                <section>
                  <label className={labelClass}>Họ tên khách thuê</label>
                  <input className={inputClass} placeholder="Nguyễn Văn B" value={formData.tenantName} onChange={e => setFormData({...formData, tenantName: e.target.value})} />
                  
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-100 rounded-2xl">
                    <input type="checkbox" id="foreigner" checked={formData.isForeigner} onChange={e => setFormData({...formData, isForeigner: e.target.checked})} className="w-5 h-5" />
                    <label htmlFor="foreigner" className="text-xs font-black uppercase text-slate-600">Khách nước ngoài</label>
                  </div>

                  <PhotoPicker label="ẢNH CCCD / CMND" multiple images={formData.tenantIdCardImages} onChange={imgs => setFormData({...formData, tenantIdCardImages: imgs})} />
                  
                  {formData.isForeigner && (
                    <div className="mt-6 p-5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-5">
                      <div className="flex items-center gap-2 mb-2">
                         <Globe size={16} className="text-amber-600"/>
                         <h4 className="text-[12px] font-black uppercase text-amber-800 tracking-widest">Hồ sơ khách nước ngoài</h4>
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl border border-amber-100/50 shadow-sm">
                         <PhotoPicker label="HỘ CHIẾU (PASSPORT)" multiple images={formData.passportImages} onChange={imgs => setFormData({...formData, passportImages: imgs})} />
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-amber-100/50 shadow-sm space-y-4">
                         <div>
                            <label htmlFor="visaExpiry" className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Thời hạn Visa (Bắt buộc)</label>
                            <input id="visaExpiry" name="visaExpiryDate" type="date" title="Ngày hết hạn visa" className={inputClass} value={formData.visaExpiryDate} onChange={e => setFormData({...formData, visaExpiryDate: e.target.value})} />
                         </div>
                         <PhotoPicker label="ẢNH CHỤP VISA" images={formData.visaImages} onChange={imgs => setFormData({...formData, visaImages: imgs})} />
                      </div>
                    </div>
                  )}
                </section>

                <section className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                      <Users size={14}/> Thành viên gia đình
                    </h4>
                    <button title="Thêm thành viên" onClick={() => setFormData({...formData, familyMembers: [...formData.familyMembers, { name: '', relationship: '', idCardOrPassport: '' }]})} className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-sm active:scale-90 transition-transform">
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  {formData.familyMembers.length > 0 ? (
                    <div className="space-y-4">
                      {formData.familyMembers.map((member, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm relative animate-in slide-in-from-left-4">
                          <button title="Xóa thành viên" onClick={() => setFormData({...formData, familyMembers: formData.familyMembers.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform z-10">
                            <Trash2 size={12} />
                          </button>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Họ tên thành viên</label>
                              <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Tên thành viên..." value={member.name} onChange={e => {
                                const up = [...formData.familyMembers];
                                up[idx].name = e.target.value;
                                setFormData({...formData, familyMembers: up});
                              }} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Quan hệ</label>
                                <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Vợ, con..." value={member.relationship} onChange={e => {
                                  const up = [...formData.familyMembers];
                                  up[idx].relationship = e.target.value;
                                  setFormData({...formData, familyMembers: up});
                                }} />
                              </div>
                              <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">CCCD/Hộ chiếu</label>
                                <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Số định danh..." value={member.idCardOrPassport} onChange={e => {
                                  const up = [...formData.familyMembers];
                                  up[idx].idCardOrPassport = e.target.value;
                                  setFormData({...formData, familyMembers: up});
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic font-bold text-center py-2">Chưa có thông tin thành viên đi cùng</p>
                  )}
                </section>

                <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> Chu kỳ thanh toán</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="rentPaymentDay" className={labelClass}>Ngày thu Tiền Nhà</label>
                      <input id="rentPaymentDay" title="Ngày thu Tiền Nhà" type="number" min="1" max="31" className={inputClass} value={formData.rentPaymentDay} onChange={e => setFormData({...formData, rentPaymentDay: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label htmlFor="rentAmount" className={labelClass}>Giá thuê (VNĐ)</label>
                      <input id="rentAmount" title="Giá thuê (VNĐ)" type="number" className={inputClass} placeholder="10.000.000" value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="electricityPaymentDay" className={labelClass}>Ngày thu Tiền Điện</label>
                      <input id="electricityPaymentDay" title="Ngày thu Tiền Điện" type="number" min="1" max="31" className={inputClass} value={formData.electricityPaymentDay} onChange={e => setFormData({...formData, electricityPaymentDay: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label htmlFor="waterPaymentDay" className={labelClass}>Ngày thu Tiền Nước</label>
                      <input id="waterPaymentDay" title="Ngày thu Tiền Nước" type="number" min="1" max="31" className={inputClass} value={formData.waterPaymentDay} onChange={e => setFormData({...formData, waterPaymentDay: parseInt(e.target.value)})} />
                    </div>
                  </div>
                </section>

                <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <label htmlFor="checkin" className={labelClass}><Calendar size={12}/> Ngày Check-in & Hết hạn HD</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input id="checkin" title="Ngày check-in" type="date" className={inputClass} value={formData.checkInDate} onChange={e => setFormData({...formData, checkInDate: e.target.value})} />
                      <input id="contractExpiry" title="Ngày hết hạn hợp đồng" type="date" className={inputClass} value={formData.contractExpiryDate} onChange={e => setFormData({...formData, contractExpiryDate: e.target.value})} />
                    </div>
                  </div>
                </section>

                <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><ImageIcon size={14}/> Hình ảnh hợp đồng thuê</h4>
                  <PhotoPicker label="ẢNH CHỤP HỢP ĐỒNG (BẮT BUỘC)" multiple images={formData.contractImages} onChange={imgs => setFormData({...formData, contractImages: imgs})} />
                </section>

                <section className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
                  <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2 mb-4"><ShieldCheck size={14}/> Đăng ký lưu trú (Bắt buộc)</h4>
                  <PhotoPicker label="ẢNH XÁC NHẬN LƯU TRÚ" images={formData.residencyImages} onChange={imgs => setFormData({...formData, residencyImages: imgs})} />
                </section>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex gap-2.5 z-[110] pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button title="Quay lại" onClick={() => step > 1 ? prevStep() : navigate(-1)} className="flex-1 py-3 bg-slate-50 border border-slate-100 text-slate-500 rounded-[12px] text-[11px] font-bold uppercase active:scale-95 transition-all">Quay Lại</button>
        {step < 4 ? (
          <button title="Tiếp theo" onClick={nextStep} className="flex-[2] py-3 bg-blue-600 text-white rounded-[12px] text-[11px] font-bold uppercase flex items-center justify-center gap-2 shadow-sm shadow-blue-200 active:scale-95 transition-all">Tiếp Theo <ChevronRight size={14} /></button>
        ) : (
          <button title="Lưu" onClick={handleSubmit} disabled={isSaving} className="flex-[2] py-3 bg-indigo-600 text-white rounded-[12px] text-[11px] font-bold uppercase flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50">{isEdit ? 'Cập Nhật' : 'Hoàn Tất'} <Save size={14} /></button>
        )}
      </div>
    </div>
  );
};

export default PropertyForm;
