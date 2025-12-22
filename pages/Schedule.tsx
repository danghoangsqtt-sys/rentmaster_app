
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, Plus, ChevronRight, 
  Trash2, CheckCircle2, AlertCircle, Building, 
  Wrench, Wallet, UserCheck, MessageSquare, ChevronLeft,
  LayoutGrid, List, Columns, RefreshCw, AlignLeft, X, Bell,
  Flag, Repeat, Timer, CheckSquare, CalendarDays, Save, Edit3
} from 'lucide-react';
import { getStoredSchedule, saveSchedule, getStoredProperties } from '../data/mockData';
import { getPropertyAlerts } from '../utils/alertUtils';
import { ScheduleEvent, EventType, Property, RepeatType, Priority } from '../types';

type ViewMode = 'day' | 'week' | 'month';

const Schedule: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const showAddForm = searchParams.get('add') === 'true';
  
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPropertyId, setNewPropertyId] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newType, setNewType] = useState<EventType>('Other');
  const [newPriority, setNewPriority] = useState<Priority>('Medium');
  const [newReminder, setNewReminder] = useState<number>(15);
  const [newRepeat, setNewRepeat] = useState<RepeatType>('none');

  useEffect(() => {
    const loadData = async () => {
      const [storedEvents, storedProps] = await Promise.all([
        getStoredSchedule(),
        getStoredProperties()
      ]);
      setEvents(storedEvents || []);
      setProperties(storedProps || []);
    };
    loadData();
  }, []);

  const allEvents = useMemo(() => {
    const manualEvents = (events || []).map(e => ({ ...e, isSystem: false }));
    const systemEvents: any[] = [];
    
    properties.forEach(p => {
      const alerts = getPropertyAlerts(p);
      alerts.forEach(alert => {
        let eventDate = '';
        if (alert.type === 'CONTRACT_EXPIRY' || alert.type === 'VISA_EXPIRY') {
          eventDate = alert.dueDate;
        } else if (p.tenant) {
          const day = alert.type === 'RENT_DUE' ? p.tenant.rentPaymentDay : p.tenant.servicePaymentDay;
          const d = new Date(currentViewDate);
          d.setDate(day);
          eventDate = d.toISOString().split('T')[0];
        }

        if (eventDate) {
          systemEvents.push({
            id: alert.id,
            title: alert.message,
            date: eventDate,
            time: '08:00',
            type: alert.type === 'RENT_DUE' ? 'Collection' : (alert.type === 'CONTRACT_EXPIRY' ? 'Contract' : 'Other'),
            priority: 'High' as Priority,
            propertyId: p.id,
            isCompleted: alert.type === 'RENT_DUE' ? p.tenant?.isRentPaid : (alert.type === 'UTILITY_DUE' ? p.tenant?.isUtilitiesPaid : false),
            isSystem: true,
            alertType: alert.type
          });
        }
      });
    });

    return [...manualEvents, ...systemEvents];
  }, [events, properties, currentViewDate]);

  const getTypeStyle = (type: string, priority?: Priority) => {
    let base = { color: 'text-slate-500', bg: 'bg-slate-400', lightBg: 'bg-slate-50', label: 'Khác', icon: MessageSquare };
    
    switch (type) {
      case 'Collection': base = { color: 'text-rose-600', bg: 'bg-rose-500', lightBg: 'bg-rose-50', label: 'Thu tiền', icon: Wallet }; break;
      case 'Maintenance': base = { color: 'text-sky-600', bg: 'bg-sky-500', lightBg: 'bg-sky-50', label: 'Bảo trì', icon: Wrench }; break;
      case 'Viewing': base = { color: 'text-amber-600', bg: 'bg-amber-500', lightBg: 'bg-amber-50', label: 'Xem nhà', icon: UserCheck }; break;
      case 'Contract': base = { color: 'text-indigo-600', bg: 'bg-indigo-500', lightBg: 'bg-indigo-50', label: 'Hợp đồng', icon: CalendarIcon }; break;
    }

    const priorityColors = {
      'High': 'border-rose-500',
      'Medium': 'border-amber-500',
      'Low': 'border-blue-500'
    };

    return { ...base, priorityBorder: priority ? priorityColors[priority] : '' };
  };

  const handlePrev = () => {
    const d = new Date(currentViewDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentViewDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentViewDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentViewDate(d);
  };

  const toggleComplete = (id: string, isSystem: boolean) => {
    if (isSystem) return;
    const updated = events.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e);
    setEvents(updated);
    saveSchedule(updated);
  };

  const handleSaveEvent = () => {
    if (!newTitle) return alert('Vui lòng nhập tên công việc');
    
    let updated: ScheduleEvent[];

    if (editingEventId) {
      // Chế độ chỉnh sửa
      updated = events.map(e => e.id === editingEventId ? {
        ...e,
        title: newTitle,
        description: newDesc,
        date: selectedDate, // Giữ nguyên ngày được chọn trong lịch
        time: newTime,
        type: newType,
        priority: newPriority,
        propertyId: newPropertyId || undefined,
        reminderMinutes: newReminder,
        repeat: newRepeat
      } : e);
    } else {
      // Chế độ thêm mới
      const newEvent: ScheduleEvent = {
        id: 'e' + Date.now(),
        title: newTitle,
        description: newDesc,
        date: selectedDate,
        time: newTime,
        type: newType,
        priority: newPriority,
        propertyId: newPropertyId || undefined,
        isCompleted: false,
        reminderMinutes: newReminder,
        repeat: newRepeat
      };
      updated = [...events, newEvent];
    }

    setEvents(updated);
    saveSchedule(updated);
    closeForm();
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      const updated = events.filter(e => e.id !== id);
      setEvents(updated);
      saveSchedule(updated);
    }
  };

  const handleEditClick = (event: ScheduleEvent) => {
    setEditingEventId(event.id);
    setNewTitle(event.title);
    setNewDesc(event.description || '');
    setNewTime(event.time);
    setNewType(event.type);
    setNewPriority(event.priority);
    setNewPropertyId(event.propertyId || '');
    setNewReminder(event.reminderMinutes || 15);
    setNewRepeat(event.repeat || 'none');
    setSearchParams({ add: 'true' });
  };

  const closeForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewPropertyId('');
    setEditingEventId(null);
    setSearchParams({});
  };

  const openFormWithPreset = (type: EventType) => {
    setEditingEventId(null);
    setNewType(type);
    setNewTitle(type === 'Maintenance' ? 'Công việc bảo trì...' : '');
    setShowQuickMenu(false);
    setSearchParams({ add: 'true' });
  };

  const monthDays = useMemo(() => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startPadding = firstDay.getDay(); 
    for (let i = startPadding; i > 0; i--) {
      days.push({ date: new Date(year, month, 1 - i), currentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false });
    }
    return days;
  }, [currentViewDate]);

  return (
    <div className={`bg-slate-50 min-h-full relative ${showAddForm ? 'h-screen overflow-hidden' : ''}`}>
      {/* Main Schedule View */}
      {!showAddForm && (
        <>
          <div className="sticky top-0 bg-white/95 backdrop-blur-md z-40 px-4 pt-4 pb-3 border-b border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                Tháng {currentViewDate.getMonth() + 1}, {currentViewDate.getFullYear()}
              </h1>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Tháng</button>
                <button onClick={() => setViewMode('day')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Ngày</button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
               <button onClick={handlePrev} className="p-1.5 text-slate-400 bg-slate-50 rounded-lg"><ChevronLeft size={16}/></button>
               <span className="text-xs font-bold text-slate-600">{currentViewDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
               <button onClick={handleNext} className="p-1.5 text-slate-400 bg-slate-50 rounded-lg"><ChevronRight size={16}/></button>
            </div>

            {viewMode === 'month' && (
              <div className="grid grid-cols-7 mb-1">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                  <div key={d} className="text-center text-[9px] font-bold text-slate-300 py-1">{d}</div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 pb-32">
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 gap-1 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm mb-6">
                {monthDays.map((dayObj, idx) => {
                  const dateStr = dayObj.date.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const dayEvents = allEvents.filter(e => e.date === dateStr);
                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square relative flex items-center justify-center transition-all cursor-pointer rounded-xl ${!dayObj.currentMonth ? 'opacity-20' : ''} ${isSelected ? 'bg-blue-50 border border-blue-100 shadow-inner' : ''}`}
                    >
                      <span className={`text-xs font-bold ${isToday ? 'w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md' : isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                        {dayObj.date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1.5 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((e, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full ${getTypeStyle(e.type).bg}`}></div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>

              <div className="space-y-3">
                {allEvents.filter(e => e.date === selectedDate).length > 0 ? (
                  allEvents
                    .filter(e => e.date === selectedDate)
                    .map(event => {
                      const style = getTypeStyle(event.type, event.priority);
                      const Icon = style.icon;
                      const property = properties.find(p => p.id === event.propertyId);
                      
                      return (
                        <div 
                          key={event.id}
                          className={`bg-white rounded-2xl border-2 p-4 flex gap-4 relative transition-all shadow-sm ${style.priorityBorder} ${event.isCompleted ? 'opacity-50' : ''}`}
                        >
                          <div className={`w-1 rounded-full shrink-0 ${style.bg} opacity-80`}></div>
                          <div className="flex-1 min-w-0" onClick={() => !event.isSystem && toggleComplete(event.id, false)}>
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`text-[10px] font-bold uppercase ${style.color}`}>
                                {event.isSystem ? 'Hệ thống' : style.label}
                               </span>
                               <span className="text-[10px] font-medium text-slate-400 ml-auto flex items-center gap-1">
                                <Clock size={12} /> {event.time}
                               </span>
                            </div>
                            <h4 className={`text-sm font-bold text-slate-800 leading-snug truncate ${event.isCompleted ? 'line-through decoration-slate-400' : ''}`}>
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-2">
                               {property && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium italic truncate">
                                  <Building size={10} /> {property.name}
                                </div>
                               )}
                               {event.repeat && event.repeat !== 'none' && (
                                 <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold uppercase">
                                   <Repeat size={10} /> {event.repeat}
                                 </div>
                               )}
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleComplete(event.id, event.isSystem); }}
                              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${event.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100' : 'border-slate-100 text-slate-100'}`}
                              disabled={event.isSystem}
                            >
                              <CheckCircle2 size={20} />
                            </button>
                            {!event.isSystem && (
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditClick(event as ScheduleEvent); }}
                                  className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                                  className="w-7 h-7 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center px-8 border-2 border-dashed border-slate-200 rounded-[2rem]">
                    <CalendarIcon size={32} className="text-slate-200 mb-3" />
                    <p className="text-xs font-medium text-slate-400 tracking-wide">Không có lịch trình cho ngày này.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Speed Dial Menu & Buttons */}
          <div className="fixed bottom-24 right-5 flex flex-col items-end gap-3 z-50">
            {showQuickMenu && (
              <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-5">
                <button 
                  onClick={() => openFormWithPreset('Maintenance')}
                  className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border border-slate-100 group active:scale-95 transition-all"
                >
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Thêm công việc</span>
                  <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-100">
                    <CheckSquare size={18} />
                  </div>
                </button>
                <button 
                  onClick={() => openFormWithPreset('Other')}
                  className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border border-slate-100 group active:scale-95 transition-all"
                >
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Thêm sự kiện</span>
                  <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <CalendarDays size={18} />
                  </div>
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setShowQuickMenu(!showQuickMenu)} 
              className={`w-14 h-14 rounded-[1.25rem] shadow-xl flex items-center justify-center transition-all border-4 border-white dark:border-slate-800 active:scale-90 ${showQuickMenu ? 'bg-slate-900 text-white rotate-45 shadow-none' : 'bg-blue-600 text-white'}`}
            >
              <Plus size={28} />
            </button>
          </div>
        </>
      )}

      {showQuickMenu && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]" 
          onClick={() => setShowQuickMenu(false)}
        />
      )}

      {/* Full-screen Optimized Add/Edit Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex flex-col font-sans overflow-hidden animate-in slide-in-from-bottom-10">
          {/* Custom Header for Form */}
          <div className="pt-12 pb-6 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
            <button onClick={closeForm} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
              <X size={20} />
            </button>
            <div className="text-center">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                {editingEventId ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình mới'}
              </h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase">Ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="w-10"></div>
          </div>

          {/* Form Content - Scrollable through buttons and past them */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-40">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên nội dung công việc</label>
              <input 
                autoFocus 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                placeholder="Ví dụ: Kiểm tra điện nước P201..." 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Flag size={12}/> Mức độ ưu tiên</label>
              <div className="flex gap-2">
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                      newPriority === p 
                      ? p === 'High' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100' : p === 'Medium' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-100'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {p === 'High' ? 'Rất Gấp' : p === 'Medium' ? 'Thường' : 'Thấp'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Clock size={12}/> Giờ bắt đầu</label>
                <input type="time" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white outline-none" value={newTime} onChange={e => setNewTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><AlignLeft size={12}/> Loại hình</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white outline-none appearance-none" value={newType} onChange={e => setNewType(e.target.value as EventType)}>
                  <option value="Collection">Thu tiền nhà</option>
                  <option value="Maintenance">Bảo trì/Sửa chữa</option>
                  <option value="Viewing">Dẫn khách xem</option>
                  <option value="Contract">Ký hợp đồng</option>
                  <option value="Other">Sự kiện khác</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Timer size={12}/> Nhắc tôi trước (Phút)</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 15, 60, 1440].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setNewReminder(mins)}
                    className={`py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${
                      newReminder === mins ? 'bg-slate-900 dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {mins < 60 ? `${mins}p` : mins === 60 ? '1h' : '1 ngày'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Repeat size={12}/> Tần suất lặp lại</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {(['none', 'daily', 'weekly', 'monthly'] as RepeatType[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setNewRepeat(r)}
                    className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase border-2 whitespace-nowrap transition-all ${
                      newRepeat === r ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-50' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {r === 'none' ? 'Một lần' : r === 'daily' ? 'Mỗi ngày' : r === 'weekly' ? 'Hàng tuần' : 'Hàng tháng'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gắn với căn hộ (Tùy chọn)</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white outline-none appearance-none"
                value={newPropertyId}
                onChange={e => setNewPropertyId(e.target.value)}
              >
                <option value="">Không gắn vào căn hộ nào</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú chi tiết</label>
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white outline-none min-h-[120px]"
                placeholder="Ví dụ: Nhắc khách thanh toán tiền điện tháng này..." 
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>

            {/* Action Buttons - Part of the scrollable flow */}
            <div className="flex gap-4 pt-6 pb-24">
              <button 
                onClick={closeForm}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-sm"
              >
                HỦY BỎ
              </button>
              <button 
                onClick={handleSaveEvent}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-blue-100 active:scale-95 transition-all"
              >
                {editingEventId ? 'CẬP NHẬT' : 'LƯU CÔNG VIỆC'} <Save size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
