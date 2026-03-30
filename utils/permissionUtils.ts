export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn("Trình duyệt không hỗ trợ Web Notification");
    return false;
  }
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error("Lỗi khi xin quyền Thông báo:", err);
    return false;
  }
};

export const requestStoragePersistence = async (): Promise<boolean> => {
  if (!navigator.storage || !navigator.storage.persist) {
    console.warn("Trình duyệt không hỗ trợ Storage Persistence");
    return false;
  }
  
  try {
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) return true;

    const granted = await navigator.storage.persist();
    return granted;
  } catch (err) {
    console.error("Lỗi khi xin quyền Lưu trữ vĩnh viễn:", err);
    return false;
  }
};

export const checkPermissionsStatus = async () => {
  let notif = 'default';
  if ('Notification' in window) {
    notif = Notification.permission;
  }

  let storage = false;
  if (navigator.storage && navigator.storage.persisted) {
    storage = await navigator.storage.persisted();
  }

  return { notification: notif, storagePersisted: storage };
};
