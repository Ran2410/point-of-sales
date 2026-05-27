import {
    getBranchesService,
    getBranchByIdService,
    createBranchService,
    updateBranchService,
    toggleBranchStatusService,
    deleteBranchService,
} from "../services/branch.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import AppError from "../utils/AppError.js";

const handleError = (res, error, context = "") => {
    if (error instanceof AppError) {
        return sendError(res, error.statusCode, error.message);
    }
    console.error(`Branch ${context} error:`, error);
    return sendError(res, 500, "Terjadi kesalahan pada server");
};

const getBranches = async (req, res) => {
    try {
        const branches = await getBranchesService(req);
        return sendSuccess(res, 200, "Daftar cabang", branches);
    } catch (error) {
        return handleError(res, error, "getBranches");
    }
};

const getBranchById = async (req, res) => {
    try {
        const branch = await getBranchByIdService(req.params.id, req);
        return sendSuccess(res, 200, "Detail cabang", branch);
    } catch (error) {
        return handleError(res, error, "getBranchById");
    }
};

const createBranch = async (req, res) => {
    try {
        const branch = await createBranchService(req.body, req);
        return sendSuccess(res, 201, "Cabang berhasil dibuat", branch);
    } catch (error) {
        return handleError(res, error, "createBranch");
    }
};

const updateBranch = async (req, res) => {
    try {
        const branch = await updateBranchService(req.params.id, req.body, req);
        return sendSuccess(res, 200, "Cabang berhasil diperbarui", branch);
    } catch (error) {
        return handleError(res, error, "updateBranch");
    }
};

const toggleBranchStatus = async (req, res) => {
    try {
        const branch = await toggleBranchStatusService(req.params.id, req);
        const msg = branch.is_active ? "Cabang berhasil diaktifkan" : "Cabang berhasil dinonaktifkan";
        return sendSuccess(res, 200, msg, branch);
    } catch (error) {
        return handleError(res, error, "toggleBranchStatus");
    }
};

const deleteBranch = async (req, res) => {
    try {
        await deleteBranchService(req.params.id, req);
        return sendSuccess(res, 200, "Cabang berhasil dihapus");
    } catch (error) {
        return handleError(res, error, "deleteBranch");
    }
};

export { getBranches, getBranchById, createBranch, updateBranch, toggleBranchStatus, deleteBranch };
