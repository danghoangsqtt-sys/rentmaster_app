
export interface Owner {
  id: string;
  name: string;
  phones: string[];
  address: string;
  avatarUrl: string; // Base64
  idCardFront: string; // Base64
  idCardBack: string; // Base64
  managementStartDate: string;
}

export interface UserProfile {
  name: string;
  photo: string;
  phone: string;
  email: string;
  bio: string;
}

export interface UserAccount {
  email: string;
  username: string;
  password?: string;
  name: string;
  photo?: string;
  isPro: boolean;
}

export interface Asset {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  condition: string;
  note?: string;
}

export interface FamilyMember {
  name: string;
  relationship: string;
  idCardOrPassport?: string;
}

export interface Tenant {
  id: string;
  name: string;
  idCardUrl?: string; // Base64
  isForeigner: boolean;
  passportUrl?: string; // Base64
  visaUrl?: string; // Base64
  visaExpiryDate?: string;
  visaReminderDays?: number; 
  checkInDate: string;
  
  // Lịch thanh toán chi tiết
  rentPaymentDay: number;
  electricityPaymentDay: number;
  waterPaymentDay: number;
  managementPaymentDay: number;
  wifiPaymentDay: number;
  
  rentAmount: number;
  servicePaymentDay: number; 
  contractExpiryDate: string;
  contractReminderDays?: number; 
  contractImages: string[]; 
  residencyRegistrationUrl?: string; // Base64
  residencyRegistrationDate?: string;
  isRentPaid: boolean;
  isUtilitiesPaid: boolean;
  familyMembers?: FamilyMember[];
}

export interface Utilities {
  electricityCode: string;
  electricityLink: string;
  electricityPaymentDay?: number;
  
  waterCode: string;
  waterLink: string;
  waterPaymentDay?: number;
  
  wifiCode: string;
  wifiLink: string;
  wifiPaymentDay?: number;
}

export interface Property {
  id: string;
  name: string;
  type: 'Apartment' | 'House' | 'Hotel';
  address: string; 
  description: string;
  structure: string; 
  condition: 'New' | 'Normal' | 'Old'; 
  totalAssetValue: number;
  status: 'Rented' | 'Available' | 'Sold';
  imageUrl: string; 
  gallery: string[]; 
  videos?: string[]; 
  ownerId: string;
  constructionYear: number;
  operationStartDate: string;
  assets: Asset[];
  tenant?: Tenant;
  utilities: Utilities;
  rating?: number; // Đánh giá chất lượng BĐS từ 1-10
  propertyNotes?: string; // Ghi chú tình trạng BĐS (pháp lý, hư hỏng, bảo trì...)
}

export type EventType = 'Collection' | 'Maintenance' | 'Viewing' | 'Contract' | 'Other';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Priority = 'Low' | 'Medium' | 'High';

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: EventType;
  priority: Priority;
  propertyId?: string;
  isCompleted: boolean;
  reminderMinutes?: number; 
  repeat?: RepeatType;
}

export type NotificationType = 
  | 'CONTRACT_EXPIRY' 
  | 'RENT_DUE' 
  | 'ELECTRICITY_DUE'
  | 'WATER_DUE'
  | 'MANAGEMENT_DUE'
  | 'WIFI_DUE'
  | 'UTILITY_DUE' 
  | 'VISA_EXPIRY'
  | 'OWNER_ELECTRICITY_DUE'
  | 'OWNER_WATER_DUE'
  | 'OWNER_WIFI_DUE';

export interface AppNotification {
  id: string;
  propertyId: string;
  propertyName: string;
  type: NotificationType;
  dueDate: string;
  message: string;
}
