import {
    getUsersService,
    createUserService,
    updateUserService,
    toggleUserStatusService,
    deleteUserService,
} from "../services/user.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import AppError from "../utils/AppError.js";

const handleError = (res, error, context = "") => {
    if (error instanceof AppError) {
        return sendError(res, error.statusCode, error.message);
    }
    console.error(`User ${context} error:`, error);
    return sendError(res, 500, "Terjadi kesalahan pada server");
};

const getUsers = async (req, res) => {
    try {
        const users = await getUsersService(req);
        return sendSuccess(res, 200, "Daftar pengguna", users);
    } catch (error) {
        return handleError(res, error, "getUsers");
    }
};

const createUser = async (req, res) => {
    try {
        const user = await createUserService(req.body, req);
        return sendSuccess(res, 201, "Pengguna berhasil dibuat", user);
    } catch (error) {
        return handleError(res, error, "createUser");
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await updateUserService(req.params.id, req.body, req);
        return sendSuccess(res, 200, "Pengguna berhasil diperbarui", user);
    } catch (error) {
        return handleError(res, error, "updateUser");
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const result = await toggleUserStatusService(req.params.id, req);
        const msg = result.is_active ? "Akun berhasil diaktifkan" : "Akun berhasil dinonaktifkan";
        return sendSuccess(res, 200, msg, result);
    } catch (error) {
        return handleError(res, error, "toggleUserStatus");
    }
};

const deleteUser = async (req, res) => {
    try {
        await deleteUserService(req.params.id, req);
        return sendSuccess(res, 200, "Pengguna berhasil dihapus");
    } catch (error) {
        return handleError(res, error, "deleteUser");
    }
};

export { getUsers, createUser, updateUser, toggleUserStatus, deleteUser };
