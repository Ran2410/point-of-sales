import bcrypt from "bcrypt";
import sequelize from "../configs/postgresql.js";
import { Op } from "sequelize";
import { User, Store, Branch } from "../models/relations.js";
import AppError from "../utils/AppError.js";
import { generateStoreCode } from "../utils/generateCode.js";

const STORE_INCLUDE = [
  {
    model: User,
    as: "users",
    where: { role: "owner" },
    required: false,
    attributes: ["id", "name", "email", "is_active"],
  },
  {
    model: Branch,
    as: "branches",
    required: false,
    attributes: ["id", "name", "code", "is_active"],
  },
];

const USER_INCLUDE = [
  {
    model: Store,
    as: "store",
    attributes: ["id", "name", "code", "is_active", "is_approved"],
  },
  { model: Branch, as: "branch", attributes: ["id", "name", "code"] },
];

const getAllStoresService = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
}) => {
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (status === "active") where.is_active = true;
  if (status === "inactive") where.is_active = false;
  if (status === "pending") where.is_approved = false;

  const { count, rows } = await Store.findAndCountAll({
    where,
    include: STORE_INCLUDE,
    limit: parseInt(limit),
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  return {
    data: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  };
};

const getStoreByIdService = async (storeId) => {
  const store = await Store.findByPk(storeId, {
    include: [
      {
        model: User,
        as: "users",
        attributes: { exclude: ["password"] },
        include: [{ model: Branch, as: "branch", attributes: ["id", "name"] }],
      },
      { model: Branch, as: "branches" },
    ],
  });

  if (!store) throw new AppError("Toko tidak ditemukan", 404);
  return store;
};

const createStoreByAdminService = async ({
  store_name,
  owner_name,
  email,
  password,
}) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new AppError("Email sudah terdaftar", 409);

  const storeCode = await generateStoreCode(store_name);
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await sequelize.transaction(async (t) => {
    const store = await Store.create(
      {
        name: store_name,
        code: storeCode,
        is_active: true,
        is_approved: true,
      },
      { transaction: t },
    );

    const owner = await User.create(
      {
        name: owner_name,
        email,
        password: hashedPassword,
        role: "owner",
        is_active: true,
        store_id: store.id,
        branch_id: null,
      },
      { transaction: t },
    );

    return { store, owner };
  });

  return {
    store: {
      id: result.store.id,
      name: result.store.name,
      code: result.store.code,
    },
    owner: {
      id: result.owner.id,
      name: result.owner.name,
      email: result.owner.email,
    },
  };
};

const approveStoreService = async (storeId) => {
  const store = await Store.findByPk(storeId);
  if (!store) throw new AppError("Toko tidak ditemukan", 404);
  if (store.is_approved)
    throw new AppError("Toko sudah disetujui sebelumnya", 400);

  await sequelize.transaction(async (t) => {
    await store.update(
      { is_active: true, is_approved: true },
      { transaction: t },
    );
    await User.update(
      { is_active: true },
      { where: { store_id: storeId, role: "owner" }, transaction: t },
    );
  });

  return { id: store.id, name: store.name, code: store.code };
};
const rejectStoreService = async (storeId) => {
  const store = await Store.findByPk(storeId);
  if (!store) throw new AppError("Toko tidak ditemukan", 404);
  if (store.is_approved)
    throw new AppError("Tidak bisa reject toko yang sudah aktif", 400);

  await sequelize.transaction(async (t) => {
    await User.destroy({ where: { store_id: storeId }, transaction: t });
    await store.destroy({ transaction: t });
  });
};

const toggleStoreStatusService = async (storeId) => {
  const store = await Store.findByPk(storeId);
  if (!store) throw new AppError("Toko tidak ditemukan", 404);
  if (!store.is_approved) throw new AppError("Toko belum disetujui", 400);

  const newStatus = !store.is_active;

  await sequelize.transaction(async (t) => {
    await store.update({ is_active: newStatus }, { transaction: t });
    await User.update(
      { is_active: newStatus },
      { where: { store_id: storeId }, transaction: t },
    );
  });

  return { id: store.id, name: store.name, is_active: newStatus };
};

const updateStoreService = async (storeId, { name }) => {
  const store = await Store.findByPk(storeId);
  if (!store) throw new AppError("Toko tidak ditemukan", 404);

  await store.update({ name });
  return store;
};

const getAllUsersService = async ({
  page = 1,
  limit = 10,
  search = "",
  role,
  status,
}) => {
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (role) where.role = role;
  if (status === "active") where.is_active = true;
  if (status === "inactive") where.is_active = false;

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    include: USER_INCLUDE,
    limit: parseInt(limit),
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  };
};

const getUserByIdService = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
    include: USER_INCLUDE,
  });

  if (!user) throw new AppError("Pengguna tidak ditemukan", 404);
  return user;
};

const toggleUserStatusService = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError("Pengguna tidak ditemukan", 404);
  if (user.role === "admin")
    throw new AppError("Tidak bisa menonaktifkan akun admin", 403);

  const newStatus = !user.is_active;

  await sequelize.transaction(async (t) => {
    await user.update({ is_active: newStatus }, { transaction: t });

    // Kalau owner di-aktifkan, aktifkan juga store-nya agar bisa login
    if (user.role === "owner" && user.store_id) {
      await Store.update(
        { is_active: newStatus, ...(newStatus ? { is_approved: true } : {}) },
        { where: { id: user.store_id }, transaction: t },
      );
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    is_active: newStatus,
  };
};

const resetUserPasswordService = async (userId, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError("Pengguna tidak ditemukan", 404);

  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashed });
};

const updateUserService = async (userId, { name, email, role }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError("Pengguna tidak ditemukan", 404);
  if (user.role === "admin" && role && role !== "admin") {
    throw new AppError("Tidak bisa mengubah role admin", 403);
  }

  if (email && email !== user.email) {
    const exists = await User.findOne({ where: { email } });
    if (exists) throw new AppError("Email sudah digunakan", 409);
  }

  await user.update({ name, email, role });

  const updated = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
    include: USER_INCLUDE,
  });

  return updated;
};

const deleteUserService = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError("Pengguna tidak ditemukan", 404);
  if (user.role === "admin")
    throw new AppError("Tidak bisa menghapus akun admin", 403);

  await user.destroy();
};

const getDashboardStatsService = async () => {
  const [
    totalStores,
    activeStores,
    pendingStores,
    totalUsers,
    activeUsers,
    totalBranches,
  ] = await Promise.all([
    Store.count(),
    Store.count({ where: { is_active: true } }),
    Store.count({ where: { is_approved: false } }),
    User.count({ where: { role: { [Op.ne]: "admin" } } }),
    User.count({ where: { is_active: true, role: { [Op.ne]: "admin" } } }),
    Branch.count(),
  ]);

  return {
    stores: {
      total: totalStores,
      active: activeStores,
      pending: pendingStores,
    },
    users: { total: totalUsers, active: activeUsers },
    branches: { total: totalBranches },
  };
};

export {
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
};
