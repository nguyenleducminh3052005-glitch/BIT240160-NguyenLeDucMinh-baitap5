import { Alert, Platform } from 'react-native';

export const colors = {
  primary: '#4F46E5',
  bg: '#F3F4F6',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  price: '#DC2626',
  success: '#059669',
  warning: '#F59E0B',
  danger: '#DC2626',
  border: '#E5E7EB',
};

export const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + ' đ';

// Thông báo: chạy được cả trên web và điện thoại
export const notify = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// Hộp thoại xác nhận: chạy được cả trên web và điện thoại
export const confirmDialog = (title, message, onConfirm, confirmText = 'Xóa') => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Hủy', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
};
