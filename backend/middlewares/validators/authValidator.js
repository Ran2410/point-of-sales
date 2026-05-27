import { sendError } from "../../utils/response.js";

/**
 * Validasi input login.
 */
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== "string" || !email.trim()) {
        errors.push("Email wajib diisi");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push("Format email tidak valid");
    }

    if (!password || typeof password !== "string" || !password.trim()) {
        errors.push("Kata sandi wajib diisi");
    }

    if (errors.length > 0) {
        return sendError(res, 400, errors.join(", "));
    }

    req.body.email    = email.trim().toLowerCase();
    req.body.password = password.trim();

    next();
};

/**
 * Validasi input register owner.
 */
const validateRegister = (req, res, next) => {
    const { store_name, owner_name, email, password } = req.body;
    const errors = [];

    if (!store_name || !store_name.trim()) {
        errors.push("Nama toko wajib diisi");
    }

    if (!owner_name || !owner_name.trim()) {
        errors.push("Nama owner wajib diisi");
    }

    if (!email || !email.trim()) {
        errors.push("Email wajib diisi");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push("Format email tidak valid");
    }

    if (!password || !password.trim()) {
        errors.push("Kata sandi wajib diisi");
    } else if (password.trim().length < 8) {
        errors.push("Kata sandi minimal 8 karakter");
    }

    if (errors.length > 0) {
        return sendError(res, 400, errors.join(", "));
    }

    req.body.store_name = store_name.trim();
    req.body.owner_name = owner_name.trim();
    req.body.email      = email.trim().toLowerCase();
    req.body.password   = password.trim();

    next();
};

export { validateLogin, validateRegister };
