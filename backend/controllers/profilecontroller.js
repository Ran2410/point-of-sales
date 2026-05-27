import { getProfileService, updateProfileService, changePasswordService } from "../services/profile.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import AppError from "../utils/AppError.js";

const handleError = (res, error, ctx = "") => {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    console.error(`Profile ${ctx} error:`, error);
    return sendError(res, 500, "Terjadi kesalahan pada server");
};

const getProfile     = async (req, res) => { try { return sendSuccess(res, 200, "Profil pengguna", await getProfileService(req)); } catch (e) { return handleError(res, e, "get"); } };
const updateProfile  = async (req, res) => { try { return sendSuccess(res, 200, "Profil berhasil diperbarui", await updateProfileService(req.body, req)); } catch (e) { return handleError(res, e, "update"); } };
const changePassword = async (req, res) => { try { await changePasswordService(req.body, req); return sendSuccess(res, 200, "Password berhasil diubah"); } catch (e) { return handleError(res, e, "changePassword"); } };

export { getProfile, updateProfile, changePassword };
