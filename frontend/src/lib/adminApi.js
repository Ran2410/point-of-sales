import api from "./api";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get("/admin/dashboard");

// ─── Store ────────────────────────────────────────────────────────────────────
export const getStores    = (params) => api.get("/admin/stores", { params });
export const getStoreById = (id)     => api.get(`/admin/stores/${id}`);
export const createStore  = (data)   => api.post("/admin/stores", data);
export const updateStore  = (id, data) => api.put(`/admin/stores/${id}`, data);
export const approveStore = (id)     => api.patch(`/admin/stores/${id}/approve`);
export const rejectStore  = (id)     => api.patch(`/admin/stores/${id}/reject`);
export const toggleStoreStatus = (id) => api.patch(`/admin/stores/${id}/toggle-status`);

// ─── User ─────────────────────────────────────────────────────────────────────
export const getUsers    = (params)    => api.get("/admin/users", { params });
export const getUserById = (id)        => api.get(`/admin/users/${id}`);
export const updateUser  = (id, data)  => api.put(`/admin/users/${id}`, data);
export const toggleUserStatus   = (id) => api.patch(`/admin/users/${id}/toggle-status`);
export const resetUserPassword  = (id, new_password) => api.patch(`/admin/users/${id}/reset-password`, { new_password });
export const deleteUser  = (id)        => api.delete(`/admin/users/${id}`);
