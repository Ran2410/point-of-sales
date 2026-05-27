import bcrypt   from "bcrypt";
import { User, Store, Branch } from "../models/relations.js";
import AppError from "../utils/AppError.js";

const USER_INCLUDE = [
    { model: Store,  as: "store",  attributes: ["id", "name", "code"] },
    { model: Branch, as: "branch", attributes: ["id", "name", "code"] },
];

// ─── Get profil sendiri ───────────────────────────────────────────────────────
const getProfileService = async (req) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
        include   : USER_INCLUDE,
    });
    if (!user) throw new AppError("Pengguna tidak ditemukan", 404);
    return user;
};

// ─── Update nama & email ──────────────────────────────────────────────────────
const updateProfileService = async ({ name, email }, req) => {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError("Pengguna tidak ditemukan", 404);

    if (email && email !== user.email) {
        const exists = await User.findOne({ where: { email } });
        if (exists) throw new AppError("Email sudah digunakan", 409);
    }

    const updates = {};
    if (name)  updates.name  = name.trim();
    if (email) updates.email = email.trim().toLowerCase();

    await user.update(updates);

    return User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
        include   : USER_INCLUDE,
    });
};

// ─── Ganti password ───────────────────────────────────────────────────────────
const changePasswordService = async ({ current_password, new_password }, req) => {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError("Pengguna tidak ditemukan", 404);

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) throw new AppError("Password saat ini tidak sesuai", 401);

    if (new_password.length < 8) throw new AppError("Password baru minimal 8 karakter", 400);
    if (current_password === new_password) throw new AppError("Password baru tidak boleh sama dengan password lama", 400);

    const hashed = await bcrypt.hash(new_password, 10);
    await user.update({ password: hashed });
};

export { getProfileService, updateProfileService, changePasswordService };
