
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
  waterCode: string;
  wifiCode: string;
  electricityLink: string;
  waterLink: string;
  wifiLink: string;
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
  status: 'Rented' | 'Available';
  imageUrl: string; 
  gallery: string[]; 
  videos?: string[]; 
  ownerId: string;
  constructionYear: number;
  operationStartDate: string;
  assets: Asset[];
  tenant?: Tenant;
  utilities: Utilities;
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
  | 'VISA_EXPIRY';

export interface AppNotification {
  id: string;
  propertyId: string;
  propertyName: string;
  type: NotificationType;
  dueDate: string;
  message: string;
}
