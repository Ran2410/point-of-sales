import { Op } from "sequelize";
import { Category } from "../models/relations.js";
import AppError from "../utils/AppError.js";

const toSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const getCategoriesService = async (req) => {
  const { store_id } = req.user;
  const { search, is_active } = req.query;

  const where = { store_id };
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  if (is_active !== undefined) where.is_active = is_active === "true";

  return Category.findAll({ where, order: [["name", "ASC"]] });
};

const getCategoryByIdService = async (id, req) => {
  const category = await Category.findOne({
    where: { id, store_id: req.user.store_id },
  });
  if (!category) throw new AppError("Kategori tidak ditemukan", 404);
  return category;
};

const createCategoryService = async ({ name, description, is_active }, req) => {
  const { store_id } = req.user;
  const slug = toSlug(name);

  const existing = await Category.findOne({ where: { store_id, slug } });
  if (existing)
    throw new AppError(`Kategori dengan nama '${name}' sudah ada`, 409);

  return Category.create({
    store_id,
    name,
    slug,
    description,
    is_active: is_active ?? true,
  });
};

const updateCategoryService = async (
  id,
  { name, description, is_active },
  req,
) => {
  const { store_id } = req.user;
  const category = await Category.findOne({ where: { id, store_id } });
  if (!category) throw new AppError("Kategori tidak ditemukan", 404);

  const updates = { description, is_active };

  if (name && name !== category.name) {
    const slug = toSlug(name);
    const exists = await Category.findOne({
      where: { store_id, slug, id: { [Op.ne]: id } },
    });
    if (exists)
      throw new AppError(`Kategori dengan nama '${name}' sudah ada`, 409);
    updates.name = name;
    updates.slug = slug;
  }

  await category.update(updates);
  return category;
};

const deleteCategoryService = async (id, req) => {
  const category = await Category.findOne({
    where: { id, store_id: req.user.store_id },
  });
  if (!category) throw new AppError("Kategori tidak ditemukan", 404);

  const { Product } = await import("../models/relations.js");
  const count = await Product.count({ where: { category_id: id } });
  if (count > 0)
    throw new AppError(
      `Tidak bisa menghapus kategori yang masih memiliki ${count} produk`,
      400,
    );

  await category.destroy();
};

export {
  getCategoriesService,
  getCategoryByIdService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
};
