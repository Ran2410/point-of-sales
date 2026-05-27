import { Op, fn, col, literal } from "sequelize";
import { Transaction, TransactionItem, Product, ProductStock, Branch, User } from "../models/relations.js";

// ─── Dashboard owner: ringkasan toko ─────────────────────────────────────────
const getOwnerDashboardService = async (req) => {
    const { store_id } = req.user;
    const today = new Date();
    const startOfDay   = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay     = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const baseWhere = { store_id, status: "completed" };

    const [
        todayTrx,
        monthTrx,
        totalBranches,
        totalProducts,
        lowStockItems,
        recentTransactions,
    ] = await Promise.all([
        // Transaksi hari ini
        Transaction.findAll({
            where  : { ...baseWhere, createdAt: { [Op.between]: [startOfDay, endOfDay] } },
            attributes: ["grand_total", "payment_method"],
        }),
        // Transaksi bulan ini
        Transaction.findAll({
            where  : { ...baseWhere, createdAt: { [Op.gte]: startOfMonth } },
            attributes: ["grand_total"],
        }),
        // Total cabang aktif
        Branch.count({ where: { store_id, is_active: true } }),
        // Total produk aktif
        Product.count({ where: { store_id, is_active: true } }),
        // Produk stok menipis (stok <= minimum_stock)
        ProductStock.findAll({
            where  : { "$product.store_id$": store_id },
            include: [{ model: Product, as: "product", attributes: ["id", "name", "unit"], where: { store_id, is_active: true } },
                      { model: Branch,  as: "branch",  attributes: ["id", "name"] }],
            having : literal("\"ProductStock\".stock <= \"ProductStock\".minimum_stock"),
        }).catch(() => []),
        // 5 transaksi terbaru
        Transaction.findAll({
            where  : { store_id },
            include: [
                { model: TransactionItem, as: "items" },
                { model: Branch, as: "branch", attributes: ["id", "name"] },
                { model: User,   as: "cashier", attributes: ["id", "name"] },
            ],
            order : [["createdAt", "DESC"]],
            limit : 5,
        }),
    ]);

    const todayRevenue  = todayTrx.reduce((s, t) => s + parseFloat(t.grand_total), 0);
    const monthRevenue  = monthTrx.reduce((s, t) => s + parseFloat(t.grand_total), 0);
    const todayByMethod = todayTrx.reduce((acc, t) => {
        acc[t.payment_method] = (acc[t.payment_method] || 0) + parseFloat(t.grand_total);
        return acc;
    }, {});

    return {
        today: {
            transactions: todayTrx.length,
            revenue     : todayRevenue,
            by_method   : todayByMethod,
        },
        month: {
            transactions: monthTrx.length,
            revenue     : monthRevenue,
        },
        overview: {
            branches: totalBranches,
            products: totalProducts,
        },
        low_stock       : lowStockItems,
        recent_transactions: recentTransactions,
    };
};

// ─── Dashboard branch_owner: ringkasan cabang ─────────────────────────────────
const getBranchDashboardService = async (req) => {
    const { store_id, branch_id } = req.user;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay   = new Date(today.setHours(23, 59, 59, 999));

    const baseWhere = { store_id, branch_id, status: "completed" };

    const [todayTrx, lowStock, recentTransactions] = await Promise.all([
        Transaction.findAll({
            where: { ...baseWhere, createdAt: { [Op.between]: [startOfDay, endOfDay] } },
            attributes: ["grand_total", "payment_method"],
        }),
        ProductStock.findAll({
            where  : { branch_id, "$product.store_id$": store_id },
            include: [{ model: Product, as: "product", attributes: ["id", "name", "unit"], where: { store_id, is_active: true } }],
            having : literal("\"ProductStock\".stock <= \"ProductStock\".minimum_stock"),
        }).catch(() => []),
        Transaction.findAll({
            where  : { store_id, branch_id },
            include: [
                { model: TransactionItem, as: "items" },
                { model: User, as: "cashier", attributes: ["id", "name"] },
            ],
            order: [["createdAt", "DESC"]],
            limit: 5,
        }),
    ]);

    return {
        today: {
            transactions: todayTrx.length,
            revenue     : todayTrx.reduce((s, t) => s + parseFloat(t.grand_total), 0),
        },
        low_stock           : lowStock,
        recent_transactions : recentTransactions,
    };
};

export { getOwnerDashboardService, getBranchDashboardService };
