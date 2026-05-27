import { sendError } from "../../utils/response.js";

const validateCreateUser = (req, res, next) => {
    const { name, email, password, role } = req.body;
    const errors = [];

    if (!name?.trim())     errors.push("Nama wajib diisi");
    if (!email?.trim())    errors.push("Email wajib diisi");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push("Format email tidak valid");
    if (!password?.trim()) errors.push("Password wajib diisi");
    else if (password.trim().length < 8) errors.push("Password minimal 8 karakter");
    if (!role)             errors.push("Role wajib dipilih");

    if (errors.length > 0) return sendError(res, 400, errors.join(", "));

    req.body.name  = name.trim();
    req.body.email = email.trim().toLowerCase();
    next();
};

const validateUpdateUser = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    if (name  !== undefined && !name?.trim())  errors.push("Nama tidak boleh kosong");
    if (email !== undefined) {
        if (!email?.trim()) errors.push("Email tidak boleh kosong");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push("Format email tidak valid");
    }
    if (password !== undefined && password && password.length < 8) {
        errors.push("Password minimal 8 karakter");
    }

    if (errors.length > 0) return sendError(res, 400, errors.join(", "));
    if (email) req.body.email = email.trim().toLowerCase();
    next();
};

export { validateCreateUser, validateUpdateUser };
