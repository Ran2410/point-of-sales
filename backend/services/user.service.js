import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User, Branch, Store } from "../models/relations.js";
import AppError from "../utils/AppError.js";

const USER_INCLUDE = [
  { model: Branch, as: "branch", attributes: ["id", "name", "code"] },
  { model: Store, as: "store", attributes: ["id", "name", "code"] },
];

const ALLOWED_ROLES = {
  owner: ["branch_owner", "cashier"],
  branch_owner: ["cashier"],
};

const getUsersService = async (req) => {
  const { store_id, branch_id, role } = req.user;

  const where = { store_id, role: { [Op.notIn]: ["admin", "owner"] } };

  if (role === "branch_owner") {
    where.branch_id = branch_id;
  }

  const users = await User.findAll({
    where,
    attributes: { exclude: ["password"] },
    include: USER_INCLUDE,
    order: [["createdAt", "DESC"]],
  });

  return users;
};

const createUserService = async (
  { name, email, password, role, branch_id, is_active },
  req,
) => {
  const { store_id, branch_id: creatorBranchId, role: creatorRole } = req.user;

  const allowed = ALLOWED_ROLES[creatorRole] || [];
  if (!allowed.includes(role)) {
    throw new AppError(
      `Role '${creatorRole}' tidak bisa membuat akun dengan role '${role}'`,
      403,
    );
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError("Email sudah terdaftar", 409);

  const targetBranchId =
    creatorRole === "branch_owner" ? creatorBranchId : branch_id;

  if (!targetBranchId) {
    throw new AppError("Branch wajib dipilih", 400);
  }

  const branch = await Branch.findOne({
    where: { id: targetBranchId, store_id },
  });
  if (!branch)
    throw new AppError("Cabang tidak ditemukan dalam toko Anda", 404);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    store_id,
    branch_id: targetBranchId,
    is_active: is_active ?? true,
  });

  const result = await User.findByPk(user.id, {
    attributes: { exclude: ["password"] },
    include: USER_INCLUDE,
  });

  return result;
};

const updateUserService = async (
  id,
  { name, email, password, role, branch_id, is_active },
  req,
) => {
  const { store_id, branch_id: creatorBranchId, role: creatorRole } = req.user;

  const target = await User.findOne({ where: { id, store_id } });
  if (!target) throw new AppError("Pengguna tidak ditemukan", 404);

  if (target.id === req.user.id)
    throw new AppError("Tidak bisa mengedit akun sendiri", 403);

  if (creatorRole === "branch_owner" && target.branch_id !== creatorBranchId) {
    throw new AppError("Akses ditolak. User bukan dari branch Anda", 403);
  }

  if (role && role !== target.role) {
    const allowed = ALLOWED_ROLES[creatorRole] || [];
    if (!allowed.includes(role)) {
      throw new AppError(`Tidak bisa mengubah role ke '${role}'`, 403);
    }
  }

  if (email && email !== target.email) {
    const exists = await User.findOne({ where: { email } });
    if (exists) throw new AppError("Email sudah digunakan", 409);
  }

  if (branch_id && branch_id !== target.branch_id) {
    if (creatorRole !== "owner") {
      throw new AppError(
        "Hanya owner yang bisa memindahkan user ke branch lain",
        403,
      );
    }
    const branch = await Branch.findOne({ where: { id: branch_id, store_id } });
    if (!branch) throw new AppError("Cabang tidak ditemukan", 404);
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (role !== undefined) updates.role = role;
  if (is_active !== undefined) updates.is_active = is_active;
  if (branch_id !== undefined && creatorRole === "owner")
    updates.branch_id = branch_id;
  if (password) updates.password = await bcrypt.hash(password, 10);

  await target.update(updates);

  const result = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
    include: USER_INCLUDE,
  });

  return result;
};

const toggleUserStatusService = async (id, req) => {
  const { store_id, branch_id: creatorBranchId, role: creatorRole } = req.user;

  const target = await User.findOne({ where: { id, store_id } });
  if (!target) throw new AppError("Pengguna tidak ditemukan", 404);
  if (target.id === req.user.id)
    throw new AppError("Tidak bisa menonaktifkan akun sendiri", 403);

  if (creatorRole === "branch_owner" && target.branch_id !== creatorBranchId) {
    throw new AppError("Akses ditolak", 403);
  }

  await target.update({ is_active: !target.is_active });
  return { id: target.id, name: target.name, is_active: !target.is_active };
};

const deleteUserService = async (id, req) => {
  const { store_id, branch_id: creatorBranchId, role: creatorRole } = req.user;

  const target = await User.findOne({ where: { id, store_id } });
  if (!target) throw new AppError("Pengguna tidak ditemukan", 404);
  if (target.id === req.user.id)
    throw new AppError("Tidak bisa menghapus akun sendiri", 403);
  if (target.role === "owner")
    throw new AppError("Tidak bisa menghapus akun owner", 403);

  if (creatorRole === "branch_owner" && target.branch_id !== creatorBranchId) {
    throw new AppError("Akses ditolak", 403);
  }

  await target.destroy();
};

export {
  getUsersService,
  createUserService,
  updateUserService,
  toggleUserStatusService,
  deleteUserService,
  ALLOWED_ROLES,
};
