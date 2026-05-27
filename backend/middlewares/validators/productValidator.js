import { sendError } from "../../utils/response.js";
import { MOVEMENT_TYPES } from "../../models/stockmovementmodels.js";

const MANUAL_ADJUSTMENT_TYPES = ["purchase", "adjustment_in", "adjustment_out", "transfer_in", "transfer_out"];

const validateCreateCategory = (req, res, next) => {
    const { name } = req.body;
    if (!name?.trim()) return sendError(res, 400, "Nama kategori wajib diisi");
    req.body.name = name.trim();
    next();
};

const validateCreateProduct = (req, res, next) => {
    const { name, sku, selling_price } = req.body;
    const errors = [];

    if (!name?.trim())       errors.push("Nama produk wajib diisi");
    if (!sku?.trim())        errors.push("SKU wajib diisi");
    if (!selling_price)      errors.push("Harga jual wajib diisi");
    if (selling_price <= 0)  errors.push("Harga jual harus lebih dari 0");

    if (errors.length > 0) return sendError(res, 400, errors.join(", "));

    req.body.name = name.trim();
    req.body.sku  = sku.trim().toUpperCase();
    next();
};

const validateAdjustStock = (req, res, next) => {
    const { branch_id, type, quantity } = req.body;
    const errors = [];

    if (!branch_id)                                errors.push("branch_id wajib diisi");
    if (!type)                                     errors.push("Tipe adjustment wajib diisi");
    else if (!MANUAL_ADJUSTMENT_TYPES.includes(type)) errors.push(`Tipe tidak valid. Pilihan: ${MANUAL_ADJUSTMENT_TYPES.join(", ")}`);
    if (!quantity || quantity <= 0)                errors.push("Quantity harus lebih dari 0");

    if (errors.length > 0) return sendError(res, 400, errors.join(", "));
    next();
};

export { validateCreateCategory, validateCreateProduct, validateAdjustStock };
