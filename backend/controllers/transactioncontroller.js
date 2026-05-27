import {
    createTransactionService,
    getTransactionByIdService,
    getTransactionsService,
    voidTransactionService,
    getDailySummaryService,
} from "../services/transaction.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import AppError from "../utils/AppError.js";

const handleError = (res, error, ctx = "") => {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    console.error(`Transaction ${ctx} error:`, error);
    return sendError(res, 500, "Terjadi kesalahan pada server");
};

const createTransaction  = async (req, res) => { try { return sendSuccess(res, 201, "Transaksi berhasil", await createTransactionService(req.body, req)); } catch (e) { return handleError(res, e, "create"); } };
const getTransactions    = async (req, res) => { try { return sendSuccess(res, 200, "Daftar transaksi", await getTransactionsService(req)); } catch (e) { return handleError(res, e, "list"); } };
const getTransactionById = async (req, res) => { try { return sendSuccess(res, 200, "Detail transaksi", await getTransactionByIdService(req.params.id, req)); } catch (e) { return handleError(res, e, "detail"); } };
const voidTransaction    = async (req, res) => { try { return sendSuccess(res, 200, "Transaksi berhasil dibatalkan", await voidTransactionService(req.params.id, req.body, req)); } catch (e) { return handleError(res, e, "void"); } };
const getDailySummary    = async (req, res) => { try { return sendSuccess(res, 200, "Ringkasan harian", await getDailySummaryService(req)); } catch (e) { return handleError(res, e, "summary"); } };

export { createTransaction, getTransactions, getTransactionById, voidTransaction, getDailySummary };
