import {
  getCategoriesService,
  getCategoryByIdService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import AppError from "../utils/AppError.js";

const handleError = (res, error, ctx = "") => {
  if (error instanceof AppError)
    return sendError(res, error.statusCode, error.message);
  console.error(`Category ${ctx} error:`, error);
  return sendError(res, 500, "Terjadi kesalahan pada server");
};

const getCategories = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      "Daftar kategori",
      await getCategoriesService(req),
    );
  } catch (e) {
    return handleError(res, e, "getCategories");
  }
};

const getCategoryById = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      "Detail kategori",
      await getCategoryByIdService(req.params.id, req),
    );
  } catch (e) {
    return handleError(res, e, "getCategoryById");
  }
};

const createCategory = async (req, res) => {
  try {
    return sendSuccess(
      res,
      201,
      "Kategori berhasil dibuat",
      await createCategoryService(req.body, req),
    );
  } catch (e) {
    return handleError(res, e, "createCategory");
  }
};

const updateCategory = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      "Kategori berhasil diperbarui",
      await updateCategoryService(req.params.id, req.body, req),
    );
  } catch (e) {
    return handleError(res, e, "updateCategory");
  }
};

const deleteCategory = async (req, res) => {
  try {
    await deleteCategoryService(req.params.id, req);
    return sendSuccess(res, 200, "Kategori berhasil dihapus");
  } catch (e) {
    return handleError(res, e, "deleteCategory");
  }
};

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
