import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// In-memory cache cho GET requests giúp load tức thì (0ms)
const requestCache = new Map();
const CACHE_TTL_MS = 15000; // 15 giây cho dữ liệu tra cứu

export const clearApiCache = () => {
  requestCache.clear();
};

// Thêm token và kiểm tra cache trước khi gửi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('viet_a_hrm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu là thao tác ghi (POST, PUT, DELETE, PATCH) -> xóa cache liên quan để đồng bộ tức thì
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      clearApiCache();
    }

    // Kiểm tra cache cho GET request nếu không có cờ bypass
    if (config.method?.toLowerCase() === 'get' && !config.headers['x-cache-bypass']) {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      const cached = requestCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        config.adapter = () => {
          return Promise.resolve({
            data: JSON.parse(JSON.stringify(cached.data)),
            status: 200,
            statusText: 'OK (from memory cache)',
            headers: cached.headers,
            config,
            request: {}
          });
        };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý lưu cache và lỗi tập trung
api.interceptors.response.use(
  (response) => {
    const config = response.config;
    if (config.method?.toLowerCase() === 'get' && response.status === 200 && !config.headers?.['x-cache-bypass']) {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      requestCache.set(cacheKey, {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Chỉ tự động logout nếu không phải đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('viet_a_hrm_token');
        localStorage.removeItem('viet_a_hrm_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
