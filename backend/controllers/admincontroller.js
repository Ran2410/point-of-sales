import {
  getAllStoresService,
  getStoreByIdService,
  createStoreByAdminService,
  approveStoreService,
  rejectStoreService,
  toggleStoreStatusService,
  updateStoreService,
  getAllUsersService,
  getUserByIdService,
  toggleUserStatusService,
  resetUserPasswordService,
  updateUserService,
  deleteUserService,
  getDashboardStatsService,
} from "../services/admin.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import AppError from "../utils/AppError.js";

const handleError = (res, error, context = "") => {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message);
  }
  console.error(`Admin ${context} error:`, error);
  return sendError(res, 500, "Terjadi kesalahan pada server");
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStatsService();
    return sendSuccess(res, 200, "Statistik dashboard", stats);
  } catch (error) {
    return handleError(res, error, "getDashboardStats");
  }
};

const getAllStores = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await getAllStoresService({ page, limit, search, status });
    return sendSuccess(res, 200, "Daftar toko", result);
  } catch (error) {
    return handleError(res, error, "getAllStores");
  }
};

const getStoreById = async (req, res) => {
  try {
    const store = await getStoreByIdService(req.params.id);
    return sendSuccess(res, 200, "Detail toko", store);
  } catch (error) {
    return handleError(res, error, "getStoreById");
  }
};

const createStore = async (req, res) => {
  try {
    const { store_name, owner_name, email, password } = req.body;
    const result = await createStoreByAdminService({
      store_name,
      owner_name,
      email,
      password,
    });
    return sendSuccess(res, 201, "Toko dan akun owner berhasil dibuat", result);
  } catch (error) {
    return handleError(res, error, "createStore");
  }
};

const approveStore = async (req, res) => {
  try {
    const store = await approveStoreService(req.params.id);
    return sendSuccess(
      res,
      200,
      `Toko '${store.name}' berhasil disetujui`,
      store,
    );
  } catch (error) {
    return handleError(res, error, "approveStore");
  }
};

const rejectStore = async (req, res) => {
  try {
    await rejectStoreService(req.params.id);
    return sendSuccess(res, 200, "Pendaftaran toko berhasil ditolak");
  } catch (error) {
    return handleError(res, error, "rejectStore");
  }
};

const toggleStoreStatus = async (req, res) => {
  try {
    const result = await toggleStoreStatusService(req.params.id);
    const msg = result.is_active
      ? "Toko berhasil diaktifkan"
      : "Toko berhasil dinonaktifkan";
    return sendSuccess(res, 200, msg, result);
  } catch (error) {
    return handleError(res, error, "toggleStoreStatus");
  }
};

const updateStore = async (req, res) => {
  try {
    const store = await updateStoreService(req.params.id, req.body);
    return sendSuccess(res, 200, "Data toko berhasil diperbarui", store);
  } catch (error) {
    return handleError(res, error, "updateStore");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page, limit, search, role, status } = req.query;
    const result = await getAllUsersService({
      page,
      limit,
      search,
      role,
      status,
    });
    return sendSuccess(res, 200, "Daftar pengguna", result);
  } catch (error) {
    return handleError(res, error, "getAllUsers");
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);
    return sendSuccess(res, 200, "Detail pengguna", user);
  } catch (error) {
    return handleError(res, error, "getUserById");
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const result = await toggleUserStatusService(req.params.id);
    const msg = result.is_active
      ? "Akun berhasil diaktifkan"
      : "Akun berhasil dinonaktifkan";
    return sendSuccess(res, 200, msg, result);
  } catch (error) {
    return handleError(res, error, "toggleUserStatus");
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 8) {
      return sendError(res, 400, "Password baru minimal 8 karakter");
    }
    await resetUserPasswordService(req.params.id, new_password);
    return sendSuccess(res, 200, "Password berhasil direset");
  } catch (error) {
    return handleError(res, error, "resetUserPassword");
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await updateUserService(req.params.id, req.body);
    return sendSuccess(res, 200, "Data pengguna berhasil diperbarui", user);
  } catch (error) {
    return handleError(res, error, "updateUser");
  }
};

const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.params.id);
    return sendSuccess(res, 200, "Pengguna berhasil dihapus");
  } catch (error) {
    return handleError(res, error, "deleteUser");
  }
};

export {
  getDashboardStats,
  getAllStores,
  getStoreById,
  createStore,
  approveStore,
  rejectStore,
  toggleStoreStatus,
  updateStore,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  resetUserPassword,
  updateUser,
  deleteUser,
};
