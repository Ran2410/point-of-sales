import {
  getProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  adjustStockService,
  getStockMovementsService,
} from "../services/product.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import AppError from "../utils/AppError.js";

const handleError = (res, error, ctx = "") => {
  if (error instanceof AppError)
    return sendError(res, error.statusCode, error.message);
  console.error(`Product ${ctx} error:`, error);
  return sendError(res, 500, "Terjadi kesalahan pada server");
};

const getProducts = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      "Daftar produk",
      await getProductsService(req),
    );
  } catch (e) {
    return handleError(res, e, "getProducts");
  }
};

const getProductById = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      "Detail produk",
      await getProductByIdService(req.params.id, req),
    );
  } catch (e) {
    return handleError(res, e, "getProductById");
  }
};

const createProduct = async (req, res) => {
  try {
    return sendSuccess(
      res,
      201,
      "Produk berhasil dibuat",
      await createProductService(req.body, req),
    );
  } catch (e) {
    return handleError(res, e, "createProduct");
  }
};

const updateProduct = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      "Produk berhasil diperbarui",
      await updateProductService(req.params.id, req.body, req),
    );
  } catch (e) {
    return handleError(res, e, "updateProduct");
  }
};

const deleteProduct = async (req, res) => {
  try {
    await deleteProductService(req.params.id, req);
    return sendSuccess(res, 200, "Produk berhasil dihapus");
  } catch (e) {
    return handleError(res, e, "deleteProduct");
  }
};

const adjustStock = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      "Stok berhasil diperbarui",
      await adjustStockService(req.params.id, req.body, req),
    );
  } catch (e) {
    return handleError(res, e, "adjustStock");
  }
};

const getStockMovements = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      "Riwayat pergerakan stok",
      await getStockMovementsService(req.params.id, req),
    );
  } catch (e) {
    return handleError(res, e, "getStockMovements");
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 400, "File gambar wajib diupload");
    const { Product } = await import("../models/relations.js");
    const product = await Product.findOne({ where: { id: req.params.id, store_id: req.user.store_id } });
    if (!product) return sendError(res, 404, "Produk tidak ditemukan");
    const imageUrl = `/uploads/products/${req.file.filename}`;
    await product.update({ image: imageUrl });
    return sendSuccess(res, 200, "Gambar berhasil diupload", { image: imageUrl });
  } catch (e) {
    return handleError(res, e, "uploadImage");
  }
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockMovements,
  uploadImage,
};
