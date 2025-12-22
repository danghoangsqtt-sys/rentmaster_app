
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("Trình duyệt này không hỗ trợ thông báo hệ thống.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendSystemNotification = (title: string, options?: NotificationOptions) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  // Thêm icon mặc định của app nếu không có
  // Fix: Removed 'vibrate' and 'badge' as they are not valid properties for the standard Notification constructor options in TypeScript.
  const defaultOptions: NotificationOptions = {
    icon: 'https://cdn-icons-png.flaticon.com/512/1239/1239525.png', // Icon đại diện app
    ...options
  };

  new Notification(title, defaultOptions);
};

export const getNotificationPermissionStatus = () => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
};
