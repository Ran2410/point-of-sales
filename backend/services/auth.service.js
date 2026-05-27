import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sequelize from "../configs/postgresql.js";
import { User, Store, Branch } from "../models/relations.js";
import AppError from "../utils/AppError.js";
import tokenBlacklist from "../utils/tokenBlacklist.js";
import { generateStoreCode } from "../utils/generateCode.js";

const USER_INCLUDE = [
  {
    model: Store,
    as: "store",
    attributes: ["id", "name", "code", "is_active", "is_approved"],
  },
  {
    model: Branch,
    as: "branch",
    attributes: ["id", "name", "code", "is_active"],
  },
];

const registerService = async ({ store_name, owner_name, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError("Email sudah terdaftar", 409);
  }

  const storeCode = await generateStoreCode(store_name);

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await sequelize.transaction(async (t) => {
    const store = await Store.create(
      {
        name: store_name,
        code: storeCode,
        is_active: false,
        is_approved: false,
      },
      { transaction: t },
    );

    const owner = await User.create(
      {
        name: owner_name,
        email,
        password: hashedPassword,
        role: "owner",
        is_active: false, 
        store_id: store.id,
        branch_id: null,
      },
      { transaction: t },
    );

    return { store, owner };
  });

  return {
    message: "Pendaftaran berhasil. Menunggu persetujuan admin.",
    store_name: result.store.name,
    store_code: result.store.code,
    owner_name: result.owner.name,
    email: result.owner.email,
  };
};

const loginService = async (email, password) => {
  const user = await User.findOne({
    where: { email },
    include: USER_INCLUDE,
  });

  if (!user) {
    throw new AppError("Pengguna tidak ditemukan", 404);
  }

  if (!user.is_active) {
    throw new AppError(
      "Akun anda belum aktif atau menunggu persetujuan admin",
      403,
    );
  }

  if (user.role !== "admin") {
    if (!user.store) {
      throw new AppError("Data toko tidak ditemukan, hubungi administrator", 403);
    }
    if (!user.store.is_approved) {
      throw new AppError("Toko belum disetujui admin, silahkan tunggu persetujuan", 403);
    }
    if (!user.store.is_active) {
      throw new AppError("Toko sedang dinonaktifkan, silahkan hubungi administrator", 403);
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Email atau kata sandi salah", 401);
  }

  const payload = {
    id: user.id,
    role: user.role,
    store_id: user.store_id ?? null,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });

  const refreshToken = jwt.sign(
    { id: user.id, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + "_refresh"),
    { expiresIn: "7d" }
  );

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    store: user.store ?? null,
    branch: user.branch ?? null,
  };

  return { token, refreshToken, user: userData };
};

const logoutService = (token) => {
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name !== "TokenExpiredError") {
      throw new AppError("Token tidak valid", 401);
    }
  }
  tokenBlacklist.add(token);
};

const getMeService = async (userId) => {
  const user = await User.findOne({
    where: { id: userId },
    attributes: { exclude: ["password"] },
    include: USER_INCLUDE,
  });

  if (!user) {
    throw new AppError("Pengguna tidak ditemukan", 404);
  }

  return user;
};

export { registerService, loginService, logoutService, getMeService };
