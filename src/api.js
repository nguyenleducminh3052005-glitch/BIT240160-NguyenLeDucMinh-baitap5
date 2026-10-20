import axios from 'axios';

// Nếu mở link này trên trình duyệt bị 404 thì thử thêm /api/v1 ở cuối
export const BASE_URL = 'https://6ad739fb95e98f36aef20eca.mockapi.io';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// ===== Categories =====
export const getCategories = () => api.get('/categories').then((r) => r.data);
export const addCategory = (data) => api.post('/categories', data).then((r) => r.data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data);

// ===== Courses =====
export const getCourses = () => api.get('/courses').then((r) => r.data);
export const getCourse = (id) => api.get(`/courses/${id}`).then((r) => r.data);
export const addCourse = (data) => api.post('/courses', data).then((r) => r.data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data).then((r) => r.data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`).then((r) => r.data);
