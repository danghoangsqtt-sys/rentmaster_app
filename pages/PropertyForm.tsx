
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Building2, User, 
  FileText, CheckCircle, Home, Hotel, MapPin, 
  Phone, Hash, Info, ChevronRight, Sparkles, X, Copy,
  Calendar, CreditCard, Link as LinkIcon, Globe, ShieldCheck, Image as ImageIcon,
  Users, UserPlus, Check, Trash2, Plus, Bell, RefreshCcw
} from 'lucide-react';
import PhotoPicker from '../components/PhotoPicker';
import { Property, Owner, Tenant, FamilyMember } from '../types';
import { saveProperties, getStoredProperties, saveOwners, getStoredOwners } from '../data/mockData';
import { StorageService } from '../services/StorageService';

const PropertyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [step, setStep] = useState(1);
  const [existingOwners, setExistingOwners] = useState<Owner[]>([]);
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
    
    // Bước 2: Chủ nhà (Nếu thêm mới)
    ownerName: '',
    ownerPhones: [''],
    ownerAddress: '',
    ownerIdCardImages: [] as string[],
    
    // Bước 3: Dịch vụ & Tài chính
    electricityCode: '',
    electricityLink: '',
    waterCode: '',
    waterLink: '',
    wifiCode: '',
    wifiLink: '',
    
    // Bước 4: Khách thuê & Hợp đồng
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
    const loadData = async () => {
      const [owners, props] = await Promise.all([getStoredOwners(), getStoredProperties()]);
      setExistingOwners(owners);

      if (isEdit) {
        const p = props.find(prop => prop.id === id);
        if (p) {
          setOwnerMode('existing');
          setSelectedOwnerId(p.ownerId);
          
          setFormData({
            ...initialFormData,
            name: p.name,
            type: p.type,
            address: p.address,
            description: p.description,
            images: [p.imageUrl, ...p.gallery],
            electricityCode: p.utilities.electricityCode,
            electricityLink: p.utilities.electricityLink,
            waterCode: p.utilities.waterCode,
            waterLink: p.utilities.waterLink,
            wifiCode: p.utilities.wifiCode,
            wifiLink: p.utilities.wifiLink,
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
  }, [id, isEdit]);

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
    return await StorageService.saveMedia(data, prefix);
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
        const storedOwners = await getStoredOwners();
        await saveOwners([...storedOwners, newOwner]);
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

      const storedProps = await getStoredProperties();
      const newProp: Property = {
        id: isEdit ? id! : 'p' + Date.now(),
        name: formData.name,
        type: formData.type,
        address: formData.address,
        description: formData.description,
        structure: formData.address,
        imageUrl: persistedPropImages[0] || '',
        gallery: persistedPropImages.slice(1),
        ownerId: ownerId || '',
        status: formData.hasTenant ? 'Rented' : 'Available',
        condition: 'Normal',
        totalAssetValue: 0,
        constructionYear: new Date().getFullYear(),
        operationStartDate: new Date().toISOString(),
        assets: [],
        tenant: tenant,
        utilities: {
          electricityCode: formData.electricityCode,
          electricityLink: formData.electricityLink,
          waterCode: formData.waterCode,
          waterLink: formData.waterLink,
          wifiCode: formData.wifiCode,
          wifiLink: formData.wifiLink
        }
      };
      
      const updatedProps = isEdit 
        ? storedProps.map(p => p.id === id ? newProp : p)
        : [...storedProps, newProp];

      await saveProperties(updatedProps);
      navigate(isEdit ? `/property/${id}` : '/properties');
    } catch (error) {
      console.error("Save error", error);
      alert("Đã có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all mb-4 shadow-sm";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 flex items-center gap-2";

  return (
    <div className="absolute inset-0 bg-slate-50 z-[100] flex flex-col font-sans overflow-hidden">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-[2.5rem] flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-600">Đang lưu hồ sơ...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white pt-safe pb-6 px-6 border-b border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-6 pt-6">
          <button onClick={() => step > 1 ? prevStep() : navigate(-1)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">{isEdit ? 'Chỉnh sửa BĐS' : 'Hồ sơ BĐS'}</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase">Bước {step} / 4</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEdit && (
              <button onClick={handleReset} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-90" title="Xóa toàn bộ">
                <RefreshCcw size={18} />
              </button>
            )}
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 px-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-40">
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
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-6">
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
              <button 
                onClick={() => setOwnerMode('existing')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${ownerMode === 'existing' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                <Users size={14} /> Chọn chủ nhà đã có
              </button>
              <button 
                onClick={() => setOwnerMode('new')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${ownerMode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                <UserPlus size={14} /> Thêm chủ nhà mới
              </button>
            </div>

            {ownerMode === 'existing' ? (
              <div className="space-y-3">
                {existingOwners.length > 0 ? (
                  existingOwners.map(owner => (
                    <button 
                      key={owner.id}
                      onClick={() => setSelectedOwnerId(owner.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${selectedOwnerId === owner.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {owner.avatarUrl ? (
                            <img src={StorageService.getDisplayUrl(owner.avatarUrl)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20} /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase italic">{owner.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{owner.phones[0]}</p>
                        </div>
                      </div>
                      {selectedOwnerId === owner.id && <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md"><Check size={14} /></div>}
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
          <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-6">
            <div className="bg-blue-600 rounded-3xl p-5 text-white shadow-lg mb-4">
              <h3 className="font-black uppercase italic text-sm flex items-center gap-2"><CreditCard size={18}/> Dịch vụ & Link thanh toán</h3>
              <p className="text-[10px] opacity-80 mt-1 font-bold">Lưu thông tin để thanh toán nhanh hàng tháng.</p>
            </div>
            
            <section className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <label className={labelClass}>Tiền Điện (Mã KH & Link)</label>
                <input className={inputClass} placeholder="Mã KH Điện..." value={formData.electricityCode} onChange={e => setFormData({...formData, electricityCode: e.target.value})} />
                <input className={inputClass} placeholder="Link thanh toán (EVN/ZaloPay...)" value={formData.electricityLink} onChange={e => setFormData({...formData, electricityLink: e.target.value})} />
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <label className={labelClass}>Tiền Nước (Mã KH & Link)</label>
                <input className={inputClass} placeholder="Mã KH Nước..." value={formData.waterCode} onChange={e => setFormData({...formData, waterCode: e.target.value})} />
                <input className={inputClass} placeholder="Link thanh toán nước..." value={formData.waterLink} onChange={e => setFormData({...formData, waterLink: e.target.value})} />
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <label className={labelClass}>Internet/Wifi (Mã & Link)</label>
                <input className={inputClass} placeholder="Mã thuê bao..." value={formData.wifiCode} onChange={e => setFormData({...formData, wifiCode: e.target.value})} />
                <input className={inputClass} placeholder="Link thanh toán cước..." value={formData.wifiLink} onChange={e => setFormData({...formData, wifiLink: e.target.value})} />
              </div>
            </section>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-6">
            <button 
              onClick={() => setFormData({...formData, hasTenant: !formData.hasTenant})}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${formData.hasTenant ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${formData.hasTenant ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <User size={20} />
                </div>
                <span className="text-sm font-black uppercase">Có khách thuê hiện tại</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.hasTenant ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200'}`}>
                {formData.hasTenant && <CheckCircle size={14} />}
              </div>
            </button>

            {formData.hasTenant && (
              <div className="space-y-6 animate-in zoom-in-95">
                <section>
                  <label className={labelClass}>Họ tên khách thuê</label>
                  <input className={inputClass} placeholder="Nguyễn Văn B" value={formData.tenantName} onChange={e => setFormData({...formData, tenantName: e.target.value})} />
                  
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-100 rounded-2xl">
                    <input type="checkbox" id="foreigner" checked={formData.isForeigner} onChange={e => setFormData({...formData, isForeigner: e.target.checked})} className="w-5 h-5" />
                    <label htmlFor="foreigner" className="text-xs font-black uppercase text-slate-600">Khách nước ngoài</label>
                  </div>

                  <PhotoPicker label="CCCD / HỘ CHIẾU KHÁCH" multiple images={formData.tenantIdCardImages} onChange={imgs => setFormData({...formData, tenantIdCardImages: imgs})} />
                  
                  {formData.isForeigner && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
                      <label className={labelClass}><Globe size={12}/> Thời hạn Visa (Cảnh báo tự động)</label>
                      <input type="date" className={inputClass} value={formData.visaExpiryDate} onChange={e => setFormData({...formData, visaExpiryDate: e.target.value})} />
                      <PhotoPicker label="ẢNH VISA" images={formData.visaImages} onChange={imgs => setFormData({...formData, visaImages: imgs})} />
                    </div>
                  )}
                </section>

                <section className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                      <Users size={14}/> Thành viên gia đình / Cùng ở
                    </h4>
                    <button onClick={() => setFormData({...formData, familyMembers: [...formData.familyMembers, { name: '', relationship: '', idCardOrPassport: '' }]})} className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm active:scale-90 transition-transform">
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  {formData.familyMembers.length > 0 ? (
                    <div className="space-y-4">
                      {formData.familyMembers.map((member, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm relative animate-in slide-in-from-left-4">
                          <button onClick={() => setFormData({...formData, familyMembers: formData.familyMembers.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform z-10">
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

                <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> Chu kỳ thanh toán</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Ngày thu Tiền Nhà</label>
                      <input type="number" min="1" max="31" className={inputClass} value={formData.rentPaymentDay} onChange={e => setFormData({...formData, rentPaymentDay: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className={labelClass}>Giá thuê (VNĐ)</label>
                      <input type="number" className={inputClass} placeholder="10.000.000" value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Ngày thu Tiền Điện</label>
                      <input type="number" min="1" max="31" className={inputClass} value={formData.electricityPaymentDay} onChange={e => setFormData({...formData, electricityPaymentDay: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className={labelClass}>Ngày thu Tiền Nước</label>
                      <input type="number" min="1" max="31" className={inputClass} value={formData.waterPaymentDay} onChange={e => setFormData({...formData, waterPaymentDay: parseInt(e.target.value)})} />
                    </div>
                  </div>
                </section>

                <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <label className={labelClass}><Calendar size={12}/> Ngày Check-in & Hết hạn hợp đồng</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="date" className={inputClass} value={formData.checkInDate} onChange={e => setFormData({...formData, checkInDate: e.target.value})} />
                      <input type="date" className={inputClass} value={formData.contractExpiryDate} onChange={e => setFormData({...formData, contractExpiryDate: e.target.value})} />
                    </div>
                  </div>
                </section>

                <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><ImageIcon size={14}/> Hình ảnh hợp đồng thuê</h4>
                  <PhotoPicker label="ẢNH CHỤP HỢP ĐỒNG (BẮT BUỘC)" multiple images={formData.contractImages} onChange={imgs => setFormData({...formData, contractImages: imgs})} />
                </section>

                <section className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 mb-4"><ShieldCheck size={14}/> Đăng ký lưu trú (Bắt buộc)</h4>
                  <PhotoPicker label="ẢNH XÁC NHẬN LƯU TRÚ / TẠM TRÚ" images={formData.residencyImages} onChange={imgs => setFormData({...formData, residencyImages: imgs})} />
                </section>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex gap-4 z-[110] pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl">
        <button onClick={() => step > 1 ? prevStep() : navigate(-1)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[11px] font-black uppercase">QUAY LẠI</button>
        {step < 4 ? (
          <button onClick={nextStep} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-3">TIẾP THEO <ChevronRight size={16} /></button>
        ) : (
          <button onClick={handleSubmit} disabled={isSaving} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-3 disabled:opacity-50">{isEdit ? 'CẬP NHẬT' : 'HOÀN TẤT'} <Save size={16} /></button>
        )}
      </div>
    </div>
  );
};

export default PropertyForm;
