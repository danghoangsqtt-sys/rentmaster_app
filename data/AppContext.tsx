import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Owner, ScheduleEvent, UserProfile, UserAccount } from '../types';
import { 
  getStoredProperties, 
  saveProperties as savePropsToStorage, 
  getStoredOwners, 
  saveOwners as saveOwnersToStorage, 
  getStoredSchedule, 
  saveSchedule as saveScheduleToStorage, 
  getStoredProfile, 
  saveProfile as saveProfileToStorage,
  seedInitialData
} from './mockData';

interface AppContextType {
  properties: Property[];
  owners: Owner[];
  schedule: ScheduleEvent[];
  profile: UserProfile | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateProperties: (props: Property[]) => Promise<void>;
  updateOwners: (owners: Owner[]) => Promise<void>;
  updateSchedule: (schedule: ScheduleEvent[]) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Đảm bảo dữ liệu mặc định đã được khởi tạo nếu chưa có
      await seedInitialData();

      const [p, o, s, pr] = await Promise.all([
        getStoredProperties(),
        getStoredOwners(),
        getStoredSchedule(),
        getStoredProfile()
      ]);
      setProperties(p);
      setOwners(o);
      setSchedule(s);
      setProfile(pr);
    } catch (e) {
      console.error("Lỗi khi load dữ liệu Global Context:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateProperties = async (newProps: Property[]) => {
    setProperties(newProps);
    await savePropsToStorage(newProps);
  };

  const updateOwners = async (newOwners: Owner[]) => {
    setOwners(newOwners);
    await saveOwnersToStorage(newOwners);
  };

  const updateSchedule = async (newSchedule: ScheduleEvent[]) => {
    setSchedule(newSchedule);
    await saveScheduleToStorage(newSchedule);
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await saveProfileToStorage(newProfile);
  };

  return (
    <AppContext.Provider 
      value={{ 
        properties, 
        owners, 
        schedule, 
        profile, 
        isLoading, 
        refreshData: loadData,
        updateProperties,
        updateOwners,
        updateSchedule,
        updateProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
