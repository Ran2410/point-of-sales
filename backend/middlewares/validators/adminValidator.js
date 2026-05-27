import { sendError } from "../../utils/response.js";

const validateCreateStore = (req, res, next) => {
    const { store_name, owner_name, email, password } = req.body;
    const errors = [];

    if (!store_name?.trim()) errors.push("Nama toko wajib diisi");
    if (!owner_name?.trim()) errors.push("Nama owner wajib diisi");

    if (!email?.trim()) {
        errors.push("Email wajib diisi");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push("Format email tidak valid");
    }

    if (!password?.trim()) {
        errors.push("Password wajib diisi");
    } else if (password.trim().length < 8) {
        errors.push("Password minimal 8 karakter");
    }

    if (errors.length > 0) return sendError(res, 400, errors.join(", "));

    req.body.store_name = store_name.trim();
    req.body.owner_name = owner_name.trim();
    req.body.email      = email.trim().toLowerCase();
    req.body.password   = password.trim();

    next();
};

const validateUpdateUser = (req, res, next) => {
    const { name, email, role } = req.body;
    const errors = [];
    const allowedRoles = ["owner", "branch_owner", "cashier"];

    if (name !== undefined && !name?.trim()) errors.push("Nama tidak boleh kosong");
    if (email !== undefined) {
        if (!email?.trim()) {
            errors.push("Email tidak boleh kosong");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.push("Format email tidak valid");
        }
    }
    if (role !== undefined && !allowedRoles.includes(role)) {
        errors.push(`Role tidak valid. Pilihan: ${allowedRoles.join(", ")}`);
    }

    if (errors.length > 0) return sendError(res, 400, errors.join(", "));
    next();
};

const validateUpdateStore = (req, res, next) => {
    const { name } = req.body;
    if (!name?.trim()) return sendError(res, 400, "Nama toko wajib diisi");
    req.body.name = name.trim();
    next();
};

export { validateCreateStore, validateUpdateUser, validateUpdateStore };
