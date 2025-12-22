
import { Property, AppNotification, NotificationType } from '../types';

export const getPropertyAlerts = (property: Property): AppNotification[] => {
  const alerts: AppNotification[] = [];
  const today = new Date();
  const currentDay = today.getDate();

  if (property.status === 'Rented' && property.tenant) {
    const t = property.tenant;

    // Helper function để tạo cảnh báo dựa trên ngày trong tháng
    const checkPaymentDay = (day: number, type: NotificationType, label: string, isPaid: boolean) => {
      if (!day || isPaid) return;
      
      const diff = day - currentDay;
      if (diff === 1) {
        alerts.push({
          id: `${type}-pre-${property.id}`,
          propertyId: property.id,
          propertyName: property.name,
          type,
          dueDate: `Ngày ${day}`,
          message: `Sắp tới hạn thu ${label} (Còn 1 ngày)`
        });
      } else if (diff === 0) {
        alerts.push({
          id: `${type}-today-${property.id}`,
          propertyId: property.id,
          propertyName: property.name,
          type,
          dueDate: `Hôm nay`,
          message: `Đến hạn thu ${label} hôm nay!`
        });
      } else if (diff < 0) {
        alerts.push({
          id: `${type}-overdue-${property.id}`,
          propertyId: property.id,
          propertyName: property.name,
          type,
          dueDate: `Quá hạn ${Math.abs(diff)} ngày`,
          message: `TRỄ HẠN THU ${label.toUpperCase()}!`
        });
      }
    };

    // 1. Tiền thuê nhà
    checkPaymentDay(t.rentPaymentDay, 'RENT_DUE', 'Tiền nhà', t.isRentPaid);

    // 2. Tiền điện
    checkPaymentDay(t.electricityPaymentDay, 'ELECTRICITY_DUE', 'Tiền điện', t.isUtilitiesPaid);

    // 3. Tiền nước
    checkPaymentDay(t.waterPaymentDay, 'WATER_DUE', 'Tiền nước', t.isUtilitiesPaid);

    // 4. Phí quản lý
    checkPaymentDay(t.managementPaymentDay, 'MANAGEMENT_DUE', 'Phí quản lý', t.isUtilitiesPaid);

    // 5. Tiền Wifi
    checkPaymentDay(t.wifiPaymentDay, 'WIFI_DUE', 'Tiền Wifi', t.isUtilitiesPaid);

    // 6. Hợp đồng hết hạn (Cảnh báo trước 30 ngày)
    const contractEnd = new Date(t.contractExpiryDate);
    const diffDays = Math.ceil((contractEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30 && diffDays >= 0) {
      alerts.push({
        id: `c-exp-${property.id}`,
        propertyId: property.id,
        propertyName: property.name,
        type: 'CONTRACT_EXPIRY',
        dueDate: t.contractExpiryDate,
        message: diffDays === 0 ? 'Hợp đồng hết hạn hôm nay!' : `Hợp đồng hết hạn sau ${diffDays} ngày`
      });
    }

    // 7. Cảnh báo Visa cho khách nước ngoài (Trước 14 ngày)
    if (t.isForeigner && t.visaExpiryDate) {
      const visaEnd = new Date(t.visaExpiryDate);
      const visaDiff = Math.ceil((visaEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (visaDiff <= 14 && visaDiff >= 0) {
        alerts.push({
          id: `v-exp-${property.id}`,
          propertyId: property.id,
          propertyName: property.name,
          type: 'VISA_EXPIRY',
          dueDate: t.visaExpiryDate,
          message: `Visa khách sắp hết hạn (${visaDiff} ngày)`
        });
      }
    }
  }

  return alerts;
};
