
import { Property, Owner, ScheduleEvent } from '../types';
import { StorageService } from '../services/StorageService';

const PROPERTIES_FILE = 'properties';
const SCHEDULE_FILE = 'schedule';
const OWNERS_FILE = 'owners';
const PROFILE_FILE = 'profile';
const USERS_FILE = 'users';

export interface UserProfile {
  name: string;
  photo: string;
  phone: string;
  email: string;
  bio: string;
}

// User account for authentication
export interface UserAccount {
  email: string;
  username: string;
  password?: string;
  name: string;
  photo?: string;
  isPro: boolean;
}

// Memory Cache
let _properties: Property[] | null = null;
let _owners: Owner[] | null = null;
let _schedule: ScheduleEvent[] | null = null;
let _profile: UserProfile | null = null;
let _users: UserAccount[] | null = null;

const seedInitialData = async () => {
  const existingProps = await StorageService.readJson(PROPERTIES_FILE);
  if (!existingProps || existingProps.length === 0) {
    const mockOwners: Owner[] = [
      {
        id: 'o1',
        name: 'Nguyễn Văn Hùng',
        phones: ['0912345678'],
        address: '123 Lê Lợi, Quận 1, TP.HCM',
        avatarUrl: 'https://i.pravatar.cc/150?u=hung',
        idCardFront: '',
        idCardBack: '',
        managementStartDate: '2024-01-10'
      }
    ];

    const mockProperties: Property[] = [
      {
        id: 'p1',
        name: 'Vinhomes Central Park - L5.2010',
        type: 'Apartment',
        address: '720A Điện Biên Phủ, Bình Thạnh',
        description: 'Căn hộ cao cấp 2 phòng ngủ, view sông, nội thất đầy đủ.',
        structure: '2PN, 2WC, 80m2',
        condition: 'New',
        totalAssetValue: 5000000000,
        status: 'Rented',
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        gallery: [],
        ownerId: 'o1',
        constructionYear: 2020,
        operationStartDate: '2021-01-01',
        assets: [],
        tenant: {
          id: 't1',
          name: 'David Smith',
          isForeigner: true,
          checkInDate: '2024-02-01',
          rentPaymentDay: 5,
          electricityPaymentDay: 10,
          waterPaymentDay: 10,
          managementPaymentDay: 5,
          wifiPaymentDay: 15,
          rentAmount: 25000000,
          servicePaymentDay: 10,
          contractExpiryDate: '2025-02-01',
          contractImages: [],
          residencyRegistrationDate: '2024-02-05',
          isRentPaid: false,
          isUtilitiesPaid: false,
          visaExpiryDate: '2024-12-31'
        },
        utilities: {
          electricityCode: 'PE010023456',
          waterCode: 'WT998877',
          wifiCode: 'FPT-VHM-L5',
          electricityLink: 'https://zalopay.vn/evn',
          waterLink: 'https://sawaco.com.vn',
          wifiLink: 'https://fpt.vn/pay'
        }
      }
    ];

    await StorageService.saveJson(OWNERS_FILE, mockOwners);
    await StorageService.saveJson(PROPERTIES_FILE, mockProperties);
    _owners = mockOwners;
    _properties = mockProperties;
  }

  // Seed default admin user if none exists
  const existingUsers = await StorageService.readJson(USERS_FILE);
  if (!existingUsers || existingUsers.length === 0) {
    const adminUser: UserAccount = {
      email: 'admin@rentmaster.pro',
      username: 'admin',
      password: '123',
      name: 'Quản lý viên',
      photo: 'https://i.pravatar.cc/150?u=manager',
      isPro: true
    };
    await StorageService.saveJson(USERS_FILE, [adminUser]);
    _users = [adminUser];
  }
};

seedInitialData();

export const getStoredProfile = async (): Promise<UserProfile> => {
  if (_profile) return _profile;
  const profile = await StorageService.readJson(PROFILE_FILE);
  _profile = profile || {
    name: 'Quản lý viên',
    photo: 'https://i.pravatar.cc/150?u=manager',
    phone: '',
    email: '',
    bio: 'Quản lý bất động sản chuyên nghiệp.'
  };
  return _profile;
};

export const saveProfile = async (profile: UserProfile) => {
  _profile = profile;
  await StorageService.saveJson(PROFILE_FILE, profile);
};

export const getStoredOwners = async (): Promise<Owner[]> => {
  if (_owners) return _owners;
  const owners = await StorageService.readJson(OWNERS_FILE);
  _owners = owners || [];
  return _owners!;
};

export const saveOwners = async (owners: Owner[]) => {
  _owners = owners;
  await StorageService.saveJson(OWNERS_FILE, owners);
};

export const getStoredProperties = async (): Promise<Property[]> => {
  if (_properties) return _properties;
  const props = await StorageService.readJson(PROPERTIES_FILE);
  _properties = props || [];
  return _properties!;
};

export const saveProperties = async (properties: Property[]) => {
  _properties = properties;
  await StorageService.saveJson(PROPERTIES_FILE, properties);
};

export const getStoredSchedule = async (): Promise<ScheduleEvent[]> => {
  if (_schedule) return _schedule;
  const schedule = await StorageService.readJson(SCHEDULE_FILE);
  _schedule = schedule || [];
  return _schedule!;
};

export const saveSchedule = async (events: ScheduleEvent[]) => {
  _schedule = events;
  await StorageService.saveJson(SCHEDULE_FILE, events);
};

/**
 * Added missing functions for user and authentication management
 */

export const getStoredUsers = async (): Promise<UserAccount[]> => {
  if (_users) return _users;
  const users = await StorageService.readJson(USERS_FILE);
  _users = users || [];
  return _users!;
};

export const saveUsersList = async (users: UserAccount[]) => {
  _users = users;
  await StorageService.saveJson(USERS_FILE, users);
};

export const verifyLogin = async (identity: string, password: string): Promise<UserAccount | null> => {
  const users = await getStoredUsers();
  const user = users.find(u => (u.username === identity || u.email === identity) && u.password === password);
  return user || null;
};

export const registerUser = async (data: any): Promise<{ success: boolean; message: string }> => {
  const users = await getStoredUsers();
  if (users.find(u => u.username === data.username || u.email === data.email)) {
    return { success: false, message: "Tài khoản hoặc email đã tồn tại." };
  }
  const newUser: UserAccount = {
    email: data.email,
    username: data.username,
    password: data.password,
    name: data.name || data.username,
    isPro: false
  };
  const updated = [...users, newUser];
  await saveUsersList(updated);
  return { success: true, message: "Đăng ký thành công!" };
};
