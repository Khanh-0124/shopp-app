const ipUrl = 'http://192.168.1.91:8088/api/v1'; // <-- Phải là 8088 (Backend)
const localhostUrl = 'http://localhost:8088/api/v1';

export const environment = {
  production: false,
  apiBaseUrl: ipUrl, // <-- Đang dùng IP để cả máy tính và điện thoại đều thấy
};
