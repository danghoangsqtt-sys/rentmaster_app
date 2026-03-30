import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, Plus, ChevronRight, ChevronDown,
  Trash2, CheckCircle2, Building, ArrowUpRight,
  Wrench, Wallet, UserCheck, MessageSquare, ChevronLeft,
  X, Flag, Repeat, Timer, CheckSquare, CalendarDays, Save, Edit3, Grid, List
} from 'lucide-react';
import { getPropertyAlerts } from '../utils/alertUtils';
import { useAppContext } from '../data/AppContext';
import { ScheduleEvent, EventType, Priority, RepeatType } from '../types';

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showAddForm = searchParams.get('add') === 'true';
  
  const { properties, schedule, updateSchedule } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  
  const ribbonRef = useRef<HTMLDivElement>(null);

  // Todo List states
  const [quickAddText, setQuickAddText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPropertyId, setNewPropertyId] = useState('');
  const [newDate, setNewDate] = useState(selectedDate);
  const [newTime, setNewTime] = useState('09:00');
  const [newType, setNewType] = useState<EventType>('Other');
  const [newPriority, setNewPriority] = useState<Priority>('Medium');
  const [newReminder, setNewReminder] = useState<number>(15);
  const [newRepeat, setNewRepeat] = useState<RepeatType>('none');

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Generate Base Events (Manual + System)
  const baseEvents = useMemo(() => {
    const manualEvents = (schedule || []).map(e => ({ ...e, isSystem: false }));
    const systemEvents: any[] = [];
    
    properties.forEach(p => {
      const alerts = getPropertyAlerts(p);
      alerts.forEach(alert => {
        if (alert.type === 'CONTRACT_EXPIRY' || alert.type === 'VISA_EXPIRY') {
           systemEvents.push({
             id: alert.id,
             title: alert.message,
             date: alert.dueDate,
             time: '08:00',
             type: alert.type === 'CONTRACT_EXPIRY' ? 'Contract' : 'Other',
             priority: 'High' as Priority,
             propertyId: p.id,
             isCompleted: false,
             isSystem: true,
             repeat: 'none'
           });
        } else if (p.tenant) {
           const day = alert.type === 'RENT_DUE' ? p.tenant.rentPaymentDay : p.tenant.servicePaymentDay;
           // Start recurring from their checkin date
           const baseDate = new Date(p.tenant.checkInDate || new Date().toISOString());
           baseDate.setDate(day);
           
           systemEvents.push({
             id: alert.id,
             title: alert.message,
             date: baseDate.toISOString().split('T')[0],
             time: '08:00',
             type: alert.type === 'RENT_DUE' ? 'Collection' : 'Other',
             priority: 'High' as Priority,
             propertyId: p.id,
             isCompleted: alert.type === 'RENT_DUE' ? p.tenant?.isRentPaid : (alert.type === 'UTILITY_DUE' ? p.tenant?.isUtilitiesPaid : false),
             isSystem: true,
             repeat: 'monthly'
           });
        }
      });
    });

    return [...manualEvents, ...systemEvents].sort((a, b) => a.time.localeCompare(b.time));
  }, [schedule, properties]);

  // 2. The Recurring Logic Engine
  const isEventOccurringOnDate = (event: any, targetDateStr: string) => {
    if (targetDateStr < event.date) return false;
    if (!event.repeat || event.repeat === 'none') {
      return targetDateStr === event.date;
    }

    const target = new Date(targetDateStr);
    const start = new Date(event.date);

    if (event.repeat === 'daily') return true;
    if (event.repeat === 'weekly') return target.getDay() === start.getDay();
    if (event.repeat === 'monthly') return target.getDate() === start.getDate();
    if (event.repeat === 'yearly') return target.getDate() === start.getDate() && target.getMonth() === start.getMonth();

    return false;
  };

  const selectedEvents = useMemo(() => {
    return baseEvents.filter(e => isEventOccurringOnDate(e, selectedDate));
  }, [baseEvents, selectedDate]);

  const pendingEvents = selectedEvents.filter(e => !e.isCompleted);
  const completedEvents = selectedEvents.filter(e => e.isCompleted);
  const selectedDateObj = new Date(selectedDate);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Collection': return { color: 'text-rose-700', bg: 'bg-rose-50', dotBg: 'bg-rose-500', border: 'border-rose-100', icon: Wallet, label: 'Thu tiền' };
      case 'Maintenance': return { color: 'text-sky-700', bg: 'bg-sky-50', dotBg: 'bg-sky-500', border: 'border-sky-100', icon: Wrench, label: 'Bảo trì' };
      case 'Viewing': return { color: 'text-amber-700', bg: 'bg-amber-50', dotBg: 'bg-amber-500', border: 'border-amber-100', icon: UserCheck, label: 'Xem nhà' };
      case 'Contract': return { color: 'text-indigo-700', bg: 'bg-indigo-50', dotBg: 'bg-indigo-500', border: 'border-indigo-100', icon: CalendarIcon, label: 'Hợp đồng' };
      default: return { color: 'text-slate-700', bg: 'bg-slate-50', dotBg: 'bg-slate-400', border: 'border-slate-100', icon: MessageSquare, label: 'Khác' };
    }
  };

  const toggleComplete = (id: string, isSystem: boolean) => {
    if (isSystem) return;
    const updated = schedule.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e);
    updateSchedule(updated);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddText.trim()) return;

    const d = new Date();
    const nextHour = String((d.getHours() + 1) % 24).padStart(2, '0');
    
    const newEvent: ScheduleEvent = {
        id: 'e' + Date.now(),
        title: quickAddText.trim(),
        description: '',
        date: selectedDate,
        time: `${nextHour}:00`,
        type: 'Other',
        priority: 'Medium',
        isCompleted: false,
        repeat: 'none'
    };
    
    updateSchedule([...schedule, newEvent]);
    setQuickAddText('');
  };

  const handleSaveEvent = () => {
    if (!newTitle) return alert('Vui lòng nhập tên công việc');
    
    let updated: ScheduleEvent[];

    if (editingEventId) {
      updated = schedule.map(e => e.id === editingEventId ? {
        ...e,
        title: newTitle,
        description: newDesc,
        date: newDate,
        time: newTime,
        type: newType,
        priority: newPriority,
        propertyId: newPropertyId || undefined,
        reminderMinutes: newReminder,
        repeat: newRepeat
      } : e);
    } else {
      const newEvent: ScheduleEvent = {
        id: 'e' + Date.now(),
        title: newTitle,
        description: newDesc,
        date: newDate,
        time: newTime,
        type: newType,
        priority: newPriority,
        propertyId: newPropertyId || undefined,
        isCompleted: false,
        reminderMinutes: newReminder,
        repeat: newRepeat
      };
      updated = [...schedule, newEvent];
    }

    updateSchedule(updated);
    closeForm();
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      const updated = schedule.filter(e => e.id !== id);
      updateSchedule(updated);
    }
  };

  const handleEditClick = (event: ScheduleEvent) => {
    setEditingEventId(event.id);
    setNewTitle(event.title);
    setNewDesc(event.description || '');
    setNewDate(event.date);
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
    setNewDate(selectedDate);
    setNewPropertyId('');
    setEditingEventId(null);
    setSearchParams({});
  };



  // Generate 60 days around today for Weekly Ribbon
  const ribbonDays = useMemo(() => {
    const days = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 15); // Start 15 days ago
    
    for (let i = 0; i < 60; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  // Generate Month Grid Array
  const monthDays = useMemo(() => {
    const year = selectedDateObj.getFullYear();
    const month = selectedDateObj.getMonth();
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
  }, [selectedDate]); // Using selectedDate to redraw month

  // Auto scroll to today on mount
  useEffect(() => {
    if (viewMode === 'week' && ribbonRef.current && !showAddForm) {
      const todayEl = ribbonRef.current.querySelector('[data-istoday="true"]') as HTMLElement;
      if (todayEl) {
        todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [showAddForm, viewMode]);

  const handlePrevMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  const handleNextMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className={`bg-white min-h-full relative ${showAddForm ? 'h-screen overflow-hidden' : ''}`}>
      {!showAddForm && (
        <>
          {/* Header & View Mode Toggle */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-40 pt-2 pb-1.5 shadow-sm border-b border-slate-100">
            <div className="px-5 mb-2 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">Lịch trình</h1>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Tháng {selectedDateObj.getMonth() + 1}, {selectedDateObj.getFullYear()}
                </p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                 <button 
                   title="Xem Dải tuần"
                   onClick={() => setViewMode('week')} 
                   className={`px-2.5 py-1 rounded-[6px] flex items-center gap-1.5 text-[9px] font-bold uppercase transition-all ${viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   <List size={10} /> Tuần
                 </button>
                 <button 
                   title="Xem Bảng tháng"
                   onClick={() => setViewMode('month')} 
                   className={`px-2.5 py-1 rounded-[6px] flex items-center gap-1.5 text-[9px] font-bold uppercase transition-all ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   <Grid size={10} /> Tháng
                 </button>
              </div>
            </div>

            {/* Ribbon View */}
            {viewMode === 'week' && (
              <div ref={ribbonRef} className="flex overflow-x-auto gap-1.5 px-5 pb-2 custom-scrollbar snap-x">
                {ribbonDays.map((d, idx) => {
                  const dateStr = d.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === todayStr;
                  const hasEvents = baseEvents.some(e => isEventOccurringOnDate(e, dateStr));
                  const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];

                  return (
                    <button
                      key={idx}
                      data-istoday={isToday}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex flex-col items-center justify-center min-w-[42px] py-1.5 rounded-xl transition-all snap-center relative border ${
                        isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200' 
                        : isToday ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-[8px] font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{dayName}</span>
                      <span className="text-[13px] font-black tracking-tight mt-0.5">{d.getDate()}</span>
                      
                      {hasEvents && (
                        <div className={`absolute bottom-1 w-[3px] h-[3px] rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Month View (Google Calendar style grid) */}
            {viewMode === 'month' && (
              <div className="px-5 pb-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-1.5">
                   <button aria-label="Tháng trước" onClick={handlePrevMonth} className="p-1 text-slate-500 bg-slate-50 rounded-md active:scale-95"><ChevronLeft size={14}/></button>
                   <button 
                     aria-label="Hôm nay"
                     onClick={() => setSelectedDate(todayStr)} 
                     className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[8px] font-bold uppercase active:scale-95 transition-transform"
                   >Hôm nay</button>
                   <button aria-label="Tháng sau" onClick={handleNextMonth} className="p-1 text-slate-500 bg-slate-50 rounded-md active:scale-95"><ChevronRight size={14}/></button>
                </div>
                <div className="grid grid-cols-7 mb-0.5 mt-1">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                    <div key={d} className="text-center text-[8px] font-bold text-slate-400 py-0.5 uppercase">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-[2px]">
                  {monthDays.map((dayObj, idx) => {
                    const dateStr = dayObj.date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === todayStr;
                    const dayEvents = baseEvents.filter(e => isEventOccurringOnDate(e, dateStr));
                    
                    return (
                      <div 
                        key={idx}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square relative flex items-center justify-center transition-all cursor-pointer rounded-lg ${!dayObj.currentMonth ? 'opacity-30' : ''} ${isSelected ? 'bg-blue-50 shadow-inner' : 'hover:bg-slate-50 border border-transparent'}`}
                      >
                        <span className={`text-[11px] font-medium ${isToday ? 'w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center shadow-sm' : isSelected ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>
                          {dayObj.date.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-[2px] flex gap-[1px] items-center justify-center w-full">
                            {dayEvents.slice(0, 3).map((e, i) => (
                              <div key={i} className={`w-[3px] h-[3px] rounded-full ${getTypeStyle(e.type).dotBg}`}></div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pt-3 pb-32">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <CalendarDays size={12} className="text-blue-500" /> 
              {selectedDate === todayStr ? 'Lịch Hôm Nay' : selectedDateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-5 px-5 pb-1">
              {['All', 'High', 'Collection', 'Maintenance'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap transition-all border ${
                    filterType === f ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f === 'All' ? 'Tất cả' : f === 'High' ? '🚨 Gấp' : f === 'Collection' ? '💰 Thu Tiền' : '🔧 Bảo trì'}
                </button>
              ))}
            </div>

            {/* Google Calendar style Agenda Timeline */}
            <div className="relative pl-[36px]">
              {/* The Vertical Axis Line */}
              <div className="absolute top-2 bottom-4 left-[18px] w-[1px] bg-slate-200 rounded-full"></div>

              {/* Pending Events */}
              {pendingEvents.length > 0 ? (
                (() => {
                  let filteredPending = pendingEvents;
                  if (filterType === 'High') filteredPending = filteredPending.filter(e => e.priority === 'High' || e.isSystem);
                  else if (filterType === 'Collection') filteredPending = filteredPending.filter(e => e.type === 'Collection');
                  else if (filterType === 'Maintenance') filteredPending = filteredPending.filter(e => e.type === 'Maintenance');
                  
                  if (filteredPending.length === 0) {
                     return (
                        <div className="mb-3 ml-0 bg-slate-50 border border-dashed border-slate-200 rounded-xl py-4 flex flex-col items-center justify-center text-slate-400">
                          <CheckSquare size={16} className="mb-1 opacity-50" />
                          <p className="text-[9px] font-bold uppercase tracking-widest">Tuyệt vời, sạch sẽ việc</p>
                        </div>
                     );
                  }

                  return filteredPending.map((event, idx) => {
                    const style = getTypeStyle(event.type);
                    return (
                      <div key={idx} className="relative mb-3 group animate-in slide-in-from-left-2 duration-300">
                        {/* Timeline Dot */}
                      <div className={`absolute top-2.5 -left-[23px] w-[10px] h-[10px] rounded-full border-[2px] border-white z-10 shadow-sm ${style.dotBg}`}></div>
                      
                      {/* Time Label */}
                      <div className="absolute top-2 -left-[70px] w-10 text-right text-[9px] font-bold text-slate-500 tracking-tight">
                        {event.time}
                      </div>

                      {/* Event Card */}
                      <div 
                        onClick={() => !event.isSystem && toggleComplete(event.id, false)}
                        className={`ml-0 bg-white rounded-[0.85rem] p-2.5 shadow-sm border ${style.border} active:scale-[0.98] transition-all flex items-start gap-2 relative overflow-hidden`}
                      >
                         {event.priority === 'High' && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-500"></div>}
                         {event.priority === 'Medium' && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500"></div>}

                         <div className="flex-1 min-w-0 pr-1">
                           <div className="flex items-center gap-2 mb-0.5">
                             <div className={`flex items-center gap-1 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${style.bg} ${style.color}`}>
                               <style.icon size={8} strokeWidth={2.5}/> {event.isSystem ? 'Hệ thống' : style.label}
                             </div>
                             {event.repeat && event.repeat !== 'none' && (
                               <div className="flex items-center gap-0.5 text-[7px] text-blue-500 font-bold uppercase bg-blue-50 px-1 py-0.5 rounded ml-auto">
                                 <Repeat size={8} /> Lặp
                               </div>
                             )}
                           </div>
                           <h4 className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">
                             {event.title}
                           </h4>
                           
                           {(event.propertyId || event.description) && (
                             <div className="flex flex-wrap items-center gap-1.5 mt-1 opacity-80">
                               {event.propertyId && (
                                 <div className="flex items-center gap-1 text-[8px] text-slate-500 font-bold uppercase truncate max-w-[120px]">
                                   <Building size={8} className="text-slate-400 shrink-0" /> <span className="truncate">{properties.find(p => p.id === event.propertyId)?.name}</span>
                                 </div>
                               )}
                             </div>
                           )}
                         </div>

                         {/* Action Buttons */}
                         <div className="flex flex-col items-center gap-1.5 shrink-0 pl-1 border-l border-slate-50">
                            {event.isSystem ? (
                               <button 
                                 aria-label="Đi tới xử lý"
                                 onClick={(e) => { e.stopPropagation(); navigate(`/property/${event.propertyId}`); }}
                                 className="w-[50px] py-1.5 rounded-lg bg-blue-50 text-blue-600 flex flex-col items-center justify-center gap-0.5 text-[7px] font-extrabold uppercase transition-all active:scale-95"
                               >
                                 <ArrowUpRight size={10} strokeWidth={3} />
                                 Mở
                               </button>
                            ) : (
                               <>
                                  <button 
                                    aria-label="Đánh dấu hoàn thành"
                                    onClick={(e) => { e.stopPropagation(); toggleComplete(event.id, event.isSystem); }}
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all active:scale-90 ${event.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-slate-200'}`}
                                  >
                                    <CheckCircle2 size={10} strokeWidth={3} />
                                  </button>
                                  
                                  <button 
                                    aria-label="Sửa"
                                    onClick={(e) => { e.stopPropagation(); handleEditClick(event); }}
                                    className="text-slate-300 p-0.5 active:text-blue-600 hover:text-slate-500 transition-colors"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                               </>
                            )}
                         </div>
                      </div>
                    </div>
                  );
                });
              })()
              ) : (
                <div className="mb-3">
                  <div className="ml-0 bg-slate-50 border border-dashed border-slate-200 rounded-xl py-4 flex flex-col items-center justify-center text-slate-400">
                    <CheckSquare size={16} className="mb-1 opacity-50" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Tuyệt vời, sạch sẽ việc</p>
                  </div>
                </div>
              )}

              {/* Quick Add Inline Box */}
              <div className="relative mt-1">
                <div className="absolute top-2 -left-[70px] w-10 text-right text-[9px] font-bold text-slate-400 tracking-tight">Thêm</div>
                <div className="absolute top-2.5 -left-[23px] w-[10px] h-[10px] rounded-full border-[2px] border-white z-10 bg-slate-200"></div>
                <form 
                  onSubmit={handleQuickAdd}
                  className="ml-0 flex items-center bg-white border border-slate-200 rounded-[0.85rem] overflow-hidden shadow-sm shadow-slate-200/50"
                >
                  <Plus size={14} className="ml-2.5 text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Nhập nhanh công việc..." 
                    className="flex-1 bg-transparent p-2 text-[11px] font-medium text-slate-800 outline-none"
                    value={quickAddText}
                    onChange={(e) => setQuickAddText(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={!quickAddText.trim()}
                    className="px-3 py-2 bg-slate-50 text-blue-600 font-bold text-[9px] uppercase disabled:opacity-50"
                  >
                    Lưu
                  </button>
                </form>
              </div>

              {/* Collapsible Completed Section */}
              {completedEvents.length > 0 && (
                <div className="mt-6 border-t border-slate-100/80 pt-3">
                  <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-1.5 mb-2 text-slate-400 hover:text-slate-600 transition-colors bg-white w-full py-1 ml-0"
                  >
                    <ChevronDown size={12} className={`transition-transform duration-300 ${showCompleted ? 'rotate-180' : ''}`} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Đã hoàn thành ({completedEvents.length})</span>
                  </button>

                  {showCompleted && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      {completedEvents.map((event, idx) => (
                        <div key={idx} className="relative mb-2 group opacity-60">
                          <div className={`absolute top-2.5 -left-[23px] w-[10px] h-[10px] rounded-full border-[2px] border-white z-10 bg-emerald-500`}></div>
                          <div className="absolute top-2 -left-[70px] w-10 text-right text-[9px] font-bold text-slate-400 tracking-tight line-through">
                            {event.time}
                          </div>
                          <div className="ml-0 bg-slate-50 rounded-xl p-2 shadow-sm border border-slate-100 flex items-start gap-2">
                            <div className="flex-1 min-w-0 pr-1 pt-0.5">
                              <h4 className="text-[10px] font-bold text-slate-500 leading-snug line-through">
                                {event.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                               <button 
                                 aria-label="Khôi phục"
                                 onClick={(e) => { e.stopPropagation(); toggleComplete(event.id, event.isSystem); }}
                                 className="w-5 h-5 rounded-full flex items-center justify-center text-emerald-500 bg-emerald-100"
                                 disabled={event.isSystem}
                               >
                                 <CheckCircle2 size={10} strokeWidth={3} />
                               </button>
                               {!event.isSystem && (
                                  <button aria-label="Xoá" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="text-slate-400 p-1 active:text-rose-500">
                                    <Trash2 size={12} />
                                  </button>
                               )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </>
      )}

      {/* Full-screen Add/Edit Form */}
      {showAddForm && (
        <div className="fixed top-0 bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[110] bg-slate-50 flex flex-col font-sans overflow-hidden animate-in slide-in-from-bottom-10 duration-300 shadow-2xl border-x border-slate-200">
          <div className="pt-safe pb-3 px-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white shadow-sm">
            <button aria-label="Đóng" onClick={closeForm} className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
              <X size={16} />
            </button>
            <div className="text-center">
              <h2 className="text-[13px] font-bold text-slate-900">
                {editingEventId ? 'Cập nhật lịch trình' : 'Tạo lịch trình mới'}
              </h2>
              <p className="text-[9px] font-bold text-blue-600 mt-0.5 uppercase tracking-wider">Ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="w-8"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="space-y-1.5">
              <label htmlFor="eventTitle" className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><CheckSquare size={10}/> Nội dung chi tiết</label>
              <input 
                id="eventTitle"
                autoFocus 
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[12px] font-bold text-slate-800 focus:border-blue-500 outline-none transition-all shadow-sm"
                placeholder="Ví dụ: Kiểm tra điện nước P201..." 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="eventDate" className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><CalendarDays size={10}/> Ngày hẹn</label>
                <input id="eventDate" type="date" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[12px] font-bold text-slate-800 outline-none focus:border-blue-500 transition-all shadow-sm" value={newDate} onChange={e => setNewDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="startTime" className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Clock size={10}/> Giờ hẹn</label>
                <input id="startTime" type="time" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[12px] font-bold text-slate-800 outline-none focus:border-blue-500 transition-all shadow-sm" value={newTime} onChange={e => setNewTime(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="eventType" className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Flag size={10}/> Phân loại</label>
              <div className="relative">
                <select id="eventType" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pr-8 text-[12px] font-bold text-slate-800 outline-none appearance-none focus:border-blue-500 transition-all shadow-sm" value={newType} onChange={e => setNewType(e.target.value as EventType)}>
                  <option value="Collection">Thu tiền</option>
                  <option value="Maintenance">Bảo trì</option>
                  <option value="Viewing">Xem nhà</option>
                  <option value="Contract">Khách Ký HĐ</option>
                  <option value="Other">Khác</option>
                </select>
                <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Repeat size={10}/> Tần suất lặp lại (Tuần/Tháng/Năm)</label>
              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pb-0.5">
                {(['none', 'daily', 'weekly', 'monthly', 'yearly'] as RepeatType[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setNewRepeat(r)}
                    className={`px-3 py-2 rounded-[10px] text-[9px] font-bold uppercase border min-w-max transition-all snap-center ${
                      newRepeat === r ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    {r === 'none' ? 'Một lần' : r === 'daily' ? 'Mỗi ngày' : r === 'weekly' ? 'Hàng tuần' : r === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Flag size={10}/> Mức độ ưu tiên</label>
              <div className="flex gap-2">
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`flex-1 py-2 rounded-[10px] text-[9px] font-bold uppercase transition-all border ${
                      newPriority === p 
                      ? p === 'High' ? 'bg-rose-50 border-rose-500 text-rose-600' : p === 'Medium' ? 'bg-amber-50 border-amber-500 text-amber-600' : 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p === 'High' ? 'Rất Gấp' : p === 'Medium' ? 'Thường' : 'Thấp'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="eventProperty" className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Building size={10}/> Liên kết Căn hộ</label>
              <div className="relative">
                <select 
                  id="eventProperty"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pr-8 text-[12px] font-bold text-slate-800 outline-none appearance-none focus:border-blue-500 transition-all shadow-sm"
                  value={newPropertyId}
                  onChange={e => setNewPropertyId(e.target.value)}
                >
                  <option value="">Không bắt buộc</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="eventDesc" className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><MessageSquare size={10}/> Ghi chú thêm</label>
              <textarea 
                id="eventDesc"
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[12px] font-medium text-slate-800 outline-none min-h-[70px] focus:border-blue-500 transition-all shadow-sm"
                placeholder="Nhập thông tin chi tiết..." 
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>
          </div>
          
          {/* Submit Action */}
          <div className="bg-white border-t border-slate-100 p-3 pb-safe shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] mt-auto z-[120]">
            <div className="flex gap-3">
              <button 
                onClick={closeForm}
                className="flex-1 py-3 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-[11px] font-bold uppercase active:scale-95 transition-transform"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveEvent}
                className="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-2 shadow-sm shadow-blue-200 active:scale-95 transition-transform"
              >
                {editingEventId ? 'Cập nhật Lịch' : 'Tạo mới'} <Save size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
