import { sendError } from "../../utils/response.js";

const validateCreateBranch = (req, res, next) => {
    const { name, code, address, phone } = req.body;
    const errors = [];

    if (!name?.trim())    errors.push("Nama cabang wajib diisi");
    if (!code?.trim())    errors.push("Kode cabang wajib diisi");
    if (!address?.trim()) errors.push("Alamat wajib diisi");
    if (!phone?.trim())   errors.push("Nomor telepon wajib diisi");

    if (errors.length > 0) return sendError(res, 400, errors.join(", "));

    req.body.name    = name.trim();
    req.body.code    = code.trim().toUpperCase();
    req.body.address = address.trim();
    req.body.phone   = phone.trim();

    next();
};

const validateUpdateBranch = (req, res, next) => {
    const { name, code, address, phone } = req.body;
    const errors = [];

    if (name    !== undefined && !name?.trim())    errors.push("Nama tidak boleh kosong");
    if (code    !== undefined && !code?.trim())    errors.push("Kode tidak boleh kosong");
    if (address !== undefined && !address?.trim()) errors.push("Alamat tidak boleh kosong");
    if (phone   !== undefined && !phone?.trim())   errors.push("Telepon tidak boleh kosong");

    if (errors.length > 0) return sendError(res, 400, errors.join(", "));

    if (code) req.body.code = code.trim().toUpperCase();

    next();
};

export { validateCreateBranch, validateUpdateBranch };
