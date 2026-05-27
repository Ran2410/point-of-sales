import api from "./api";

export const createTransaction  = (data)    => api.post("/transactions", data);
export const getTransactions    = (params)  => api.get("/transactions", { params });
export const getTransactionById = (id)      => api.get(`/transactions/${id}`);
export const voidTransaction    = (id, data) => api.patch(`/transactions/${id}/void`, data);
export const getDailySummary    = (params)  => api.get("/transactions/summary", { params });
