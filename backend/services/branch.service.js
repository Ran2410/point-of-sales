import { Op } from "sequelize";
import { Branch, User } from "../models/relations.js";
import AppError from "../utils/AppError.js";

const getBranchesService = async (req) => {
  const { store_id, branch_id, role } = req.user;

  const where = { store_id };

  if (role === "branch_owner" || role === "cashier") {
    where.id = branch_id;
  }

  const branches = await Branch.findAll({
    where,
    include: [
      {
        model: User,
        as: "users",
        attributes: ["id", "name", "role", "is_active"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  return branches;
};

const getBranchByIdService = async (id, req) => {
  const { store_id, branch_id, role } = req.user;

  if (
    (role === "branch_owner" || role === "cashier") &&
    Number(id) !== branch_id
  ) {
    throw new AppError("Akses ditolak", 403);
  }

  const branch = await Branch.findOne({
    where: { id, store_id },
    include: [
      {
        model: User,
        as: "users",
        attributes: ["id", "name", "role", "is_active"],
      },
    ],
  });

  if (!branch) throw new AppError("Cabang tidak ditemukan", 404);
  return branch;
};

const createBranchService = async (
  { name, code, address, phone, is_active },
  req,
) => {
  const { store_id } = req.user;

  const existing = await Branch.findOne({ where: { code, store_id } });
  if (existing)
    throw new AppError(`Kode cabang '${code}' sudah digunakan`, 409);

  const branch = await Branch.create({
    name,
    code,
    address,
    phone,
    is_active,
    store_id,
  });
  return branch;
};

const updateBranchService = async (
  id,
  { name, code, address, phone, is_active },
  req,
) => {
  const { store_id } = req.user;

  const branch = await Branch.findOne({ where: { id, store_id } });
  if (!branch) throw new AppError("Cabang tidak ditemukan", 404);

  if (code && code !== branch.code) {
    const existing = await Branch.findOne({ where: { code, store_id } });
    if (existing)
      throw new AppError(`Kode cabang '${code}' sudah digunakan`, 409);
  }

  await branch.update({ name, code, address, phone, is_active });
  return branch;
};

const toggleBranchStatusService = async (id, req) => {
  const { store_id } = req.user;

  const branch = await Branch.findOne({ where: { id, store_id } });
  if (!branch) throw new AppError("Cabang tidak ditemukan", 404);

  await branch.update({ is_active: !branch.is_active });
  return branch;
};

const deleteBranchService = async (id, req) => {
  const { store_id } = req.user;

  const branch = await Branch.findOne({ where: { id, store_id } });
  if (!branch) throw new AppError("Cabang tidak ditemukan", 404);

  const userCount = await User.count({ where: { branch_id: id } });
  if (userCount > 0) {
    throw new AppError(
      `Tidak bisa menghapus cabang yang masih memiliki ${userCount} pengguna aktif`,
      400,
    );
  }

  await branch.destroy();
};

export {
  getBranchesService,
  getBranchByIdService,
  createBranchService,
  updateBranchService,
  toggleBranchStatusService,
  deleteBranchService,
};
