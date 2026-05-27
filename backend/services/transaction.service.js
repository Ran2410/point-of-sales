import { Op } from "sequelize";
import sequelize from "../configs/postgresql.js";
import {
  Transaction,
  TransactionItem,
  Product,
  ProductStock,
  Branch,
  User,
} from "../models/relations.js";
import AppError from "../utils/AppError.js";
import { decreaseStock, increaseStock } from "../utils/stockHelper.js";

const generateTransactionCode = async (branchCode) => {
  const date = new Date();
  const prefix = `TRX-${branchCode}-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const count = await Transaction.count({
    where: { transaction_code: { [Op.like]: `${prefix}%` } },
  });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
};

const createTransactionService = async (body, req) => {
  const { store_id, branch_id, id: cashier_id } = req.user;
  const {
    items,
    payment_method = "cash",
    amount_paid,
    discount_amount = 0,
    tax_amount = 0,
    notes,
  } = body;

  if (!items || items.length === 0)
    throw new AppError("Transaksi harus memiliki minimal 1 item", 400);
  if (!amount_paid) throw new AppError("Jumlah pembayaran wajib diisi", 400);

  const branch = await Branch.findByPk(branch_id);
  if (!branch) throw new AppError("Cabang tidak ditemukan", 404);

  const result = await sequelize.transaction(async (t) => {
    const enrichedItems = [];
    let total_amount = 0;

    for (const item of items) {
      const product = await Product.findOne({
        where: { id: item.product_id, store_id, is_active: true },
        transaction: t,
      });
      if (!product)
        throw new AppError(
          `Produk ID ${item.product_id} tidak ditemukan atau tidak aktif`,
          404,
        );

      const stock = await ProductStock.findOne({
        where: { product_id: item.product_id, branch_id },
        transaction: t,
        lock: true,
      });
      if (!stock || stock.stock < item.quantity) {
        throw new AppError(
          `Stok ${product.name} tidak cukup. Tersedia: ${stock?.stock ?? 0}, dibutuhkan: ${item.quantity}`,
          400,
        );
      }

      const unit_price = parseFloat(product.selling_price);
      const item_discount = item.discount || 0;
      const subtotal = unit_price * item.quantity - item_discount;
      total_amount += subtotal;

      enrichedItems.push({
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit: product.unit,
        quantity: item.quantity,
        unit_price,
        discount: item_discount,
        subtotal,
      });
    }

    const grand_total =
      total_amount - parseFloat(discount_amount) + parseFloat(tax_amount);
    const change_amount = parseFloat(amount_paid) - grand_total;

    if (change_amount < 0) {
      throw new AppError(
        `Pembayaran kurang. Dibutuhkan: ${grand_total}, dibayar: ${amount_paid}`,
        400,
      );
    }

    const transaction_code = await generateTransactionCode(branch.code);
    const trx = await Transaction.create(
      {
        store_id,
        branch_id,
        cashier_id,
        transaction_code,
        total_amount,
        discount_amount: parseFloat(discount_amount),
        tax_amount: parseFloat(tax_amount),
        grand_total,
        payment_method,
        amount_paid: parseFloat(amount_paid),
        change_amount,
        status: "completed",
        notes,
      },
      { transaction: t },
    );

    for (const item of enrichedItems) {
      await TransactionItem.create(
        { transaction_id: trx.id, ...item },
        { transaction: t },
      );

      await decreaseStock(
        {
          product_id: item.product_id,
          branch_id,
          store_id,
          quantity: item.quantity,
          type: "sale",
          reference_id: trx.id,
          reference_type: "transaction",
          notes: `Penjualan ${transaction_code}`,
          created_by: cashier_id,
        },
        t,
      );
    }

    return trx;
  });

  return getTransactionByIdService(result.id, req);
};

const getTransactionByIdService = async (id, req) => {
  const { store_id, branch_id, role } = req.user;
  const where = { id, store_id };
  if (role === "branch_owner" || role === "cashier")
    where.branch_id = branch_id;

  const trx = await Transaction.findOne({
    where,
    include: [
      { model: TransactionItem, as: "items" },
      { model: Branch, as: "branch", attributes: ["id", "name", "code"] },
      { model: User, as: "cashier", attributes: ["id", "name"] },
    ],
  });
  if (!trx) throw new AppError("Transaksi tidak ditemukan", 404);
  return trx;
};

const getTransactionsService = async (req) => {
  const { store_id, branch_id, role } = req.user;
  const {
    page = 1,
    limit = 20,
    date_from,
    date_to,
    cashier_id,
    status,
  } = req.query;
  const offset = (page - 1) * limit;

  const where = { store_id };
  if (role === "branch_owner" || role === "cashier")
    where.branch_id = branch_id;
  if (status) where.status = status;
  if (cashier_id) where.cashier_id = cashier_id;
  if (date_from || date_to) {
    where.createdAt = {};
    if (date_from) where.createdAt[Op.gte] = new Date(date_from);
    if (date_to) where.createdAt[Op.lte] = new Date(date_to + "T23:59:59");
  }

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    include: [
      { model: TransactionItem, as: "items" },
      { model: Branch, as: "branch", attributes: ["id", "name"] },
      { model: User, as: "cashier", attributes: ["id", "name"] },
    ],
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

const voidTransactionService = async (id, { notes }, req) => {
  const { store_id, branch_id, id: userId, role } = req.user;
  const where = { id, store_id, status: "completed" };
  if (role === "cashier") where.branch_id = branch_id;

  const trx = await Transaction.findOne({
    where,
    include: [{ model: TransactionItem, as: "items" }],
  });
  if (!trx)
    throw new AppError("Transaksi tidak ditemukan atau sudah dibatalkan", 404);

  await sequelize.transaction(async (t) => {
    for (const item of trx.items) {
      if (!item.product_id) continue;
      await increaseStock(
        {
          product_id: item.product_id,
          branch_id: trx.branch_id,
          store_id,
          quantity: item.quantity,
          type: "sale_return",
          reference_id: trx.id,
          reference_type: "transaction",
          notes: `Void transaksi ${trx.transaction_code}`,
          created_by: userId,
        },
        t,
      );
    }

    await trx.update(
      { status: "cancelled", notes: notes || trx.notes },
      { transaction: t },
    );
  });

  return {
    id: trx.id,
    transaction_code: trx.transaction_code,
    status: "cancelled",
  };
};

const getDailySummaryService = async (req) => {
  const { store_id, branch_id, role } = req.user;
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split("T")[0];

  const where = {
    store_id,
    status: "completed",
    createdAt: {
      [Op.gte]: new Date(targetDate + "T00:00:00"),
      [Op.lte]: new Date(targetDate + "T23:59:59"),
    },
  };
  if (role === "branch_owner" || role === "cashier")
    where.branch_id = branch_id;

  const transactions = await Transaction.findAll({
    where,
    include: [{ model: TransactionItem, as: "items" }],
  });

  const total_transactions = transactions.length;
  const total_revenue = transactions.reduce(
    (s, t) => s + parseFloat(t.grand_total),
    0,
  );
  const total_items_sold = transactions.reduce(
    (s, t) => s + t.items.reduce((si, i) => si + i.quantity, 0),
    0,
  );

  const by_payment = transactions.reduce((acc, t) => {
    acc[t.payment_method] =
      (acc[t.payment_method] || 0) + parseFloat(t.grand_total);
    return acc;
  }, {});

  return {
    date: targetDate,
    total_transactions,
    total_revenue,
    total_items_sold,
    by_payment,
  };
};

export {
  createTransactionService,
  getTransactionByIdService,
  getTransactionsService,
  voidTransactionService,
  getDailySummaryService,
};
