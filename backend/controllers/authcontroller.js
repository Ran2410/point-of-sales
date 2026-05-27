import { registerService, loginService, logoutService, getMeService } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import { User, Store, Branch } from "../models/relations.js";

const register = async (req, res) => {
    try {
        const { store_name, owner_name, email, password } = req.body;
        const result = await registerService({ store_name, owner_name, email, password });

        return sendSuccess(res, 201, result.message, {
            store_name: result.store_name,
            store_code: result.store_code,
            owner_name: result.owner_name,
            email     : result.email,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return sendError(res, error.statusCode, error.message);
        }
        console.error("Register error:", error);
        return sendError(res, 500, "Terjadi kesalahan pada server");
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginService(email, password);

        return sendSuccess(res, 200, "Login berhasil", result);
    } catch (error) {
        if (error instanceof AppError) {
            return sendError(res, error.statusCode, error.message);
        }
        console.error("Login error:", error);
        return sendError(res, 500, "Terjadi kesalahan pada server");
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        await logoutService(token);

        return sendSuccess(res, 200, "Logout berhasil");
    } catch (error) {
        if (error instanceof AppError) {
            return sendError(res, error.statusCode, error.message);
        }
        console.error("Logout error:", error);
        return sendError(res, 500, "Terjadi kesalahan pada server");
    }
};

const getMe = async (req, res) => {
    try {
        const user = await getMeService(req.user.id);

        return sendSuccess(res, 200, "Data pengguna berhasil diambil", user);
    } catch (error) {
        if (error instanceof AppError) {
            return sendError(res, error.statusCode, error.message);
        }
        console.error("GetMe error:", error);
        return sendError(res, 500, "Terjadi kesalahan pada server");
    }
};

export { register, login, logout, getMe, refreshToken };

async function refreshToken(req, res) {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) return sendError(res, 400, "Refresh token wajib diisi");

        const secret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + "_refresh");
        let decoded;
        try {
            decoded = jwt.verify(refresh_token, secret);
        } catch {
            return sendError(res, 401, "Refresh token tidak valid atau sudah kadaluarsa");
        }

        if (decoded.type !== "refresh") return sendError(res, 401, "Token bukan refresh token");

        const user = await User.findOne({
            where  : { id: decoded.id, is_active: true },
            include: [
                { model: Store,  as: "store",  attributes: ["id", "name", "is_active"] },
                { model: Branch, as: "branch", attributes: ["id", "name", "is_active"] },
            ]
        });

        if (!user) return sendError(res, 401, "User tidak ditemukan");

        const newToken = jwt.sign(
            { id: user.id, role: user.role, store_id: user.store_id ?? null },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
        );

        return sendSuccess(res, 200, "Token diperbarui", { token: newToken });
    } catch (error) {
        console.error("RefreshToken error:", error);
        return sendError(res, 500, "Terjadi kesalahan pada server");
    }
}
