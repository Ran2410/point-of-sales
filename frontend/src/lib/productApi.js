import api from "./api";

// ─── Categories ───────────────────────────────────────────────────────────────
export const getCategories   = (params)      => api.get("/categories", { params });
export const createCategory  = (data)        => api.post("/categories", data);
export const updateCategory  = (id, data)    => api.put(`/categories/${id}`, data);
export const deleteCategory  = (id)          => api.delete(`/categories/${id}`);

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts        = (params)      => api.get("/products", { params });
export const getProductById     = (id)          => api.get(`/products/${id}`);
export const createProduct      = (data)        => api.post("/products", data);
export const updateProduct      = (id, data)    => api.put(`/products/${id}`, data);
export const deleteProduct      = (id)          => api.delete(`/products/${id}`);
export const adjustStock        = (id, data)    => api.post(`/products/${id}/adjust-stock`, data);
export const getStockMovements  = (id, params)  => api.get(`/products/${id}/movements`, { params });
