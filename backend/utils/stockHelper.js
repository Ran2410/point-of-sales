import sequelize      from "../configs/postgresql.js";
import { ProductStock, StockMovement } from "../models/relations.js";
import AppError from "./AppError.js";

/**
 * Kurangi stok (untuk sale, adjustment_out, transfer_out)
 * Lempar error jika stok tidak cukup.
 */
const decreaseStock = async ({ product_id, branch_id, store_id, quantity, type, reference_id = null, reference_type = null, notes = null, created_by }, transaction) => {
    const stock = await ProductStock.findOne({
        where: { product_id, branch_id },
        transaction,
        lock : true, // row-level lock untuk mencegah race condition
    });

    if (!stock) throw new AppError("Data stok cabang tidak ditemukan", 404);
    if (stock.stock < quantity) {
        throw new AppError(`Stok tidak cukup. Tersedia: ${stock.stock}, dibutuhkan: ${quantity}`, 400);
    }

    const previous_stock = stock.stock;
    const current_stock  = previous_stock - quantity;

    await stock.update({ stock: current_stock }, { transaction });

    await StockMovement.create({
        store_id, product_id, branch_id,
        type, quantity, previous_stock, current_stock,
        reference_id, reference_type, notes, created_by,
    }, { transaction });

    return current_stock;
};

/**
 * Tambah stok (untuk purchase, sale_return, adjustment_in, transfer_in, initial)
 */
const increaseStock = async ({ product_id, branch_id, store_id, quantity, type, reference_id = null, reference_type = null, notes = null, created_by }, transaction) => {
    // findOrCreate: buat record stok jika belum ada (misal produk baru di cabang ini)
    const [stock] = await ProductStock.findOrCreate({
        where   : { product_id, branch_id },
        defaults: { stock: 0, minimum_stock: 0 },
        transaction,
        lock    : true,
    });

    const previous_stock = stock.stock;
    const current_stock  = previous_stock + quantity;

    await stock.update({ stock: current_stock }, { transaction });

    await StockMovement.create({
        store_id, product_id, branch_id,
        type, quantity, previous_stock, current_stock,
        reference_id, reference_type, notes, created_by,
    }, { transaction });

    return current_stock;
};

/**
 * Set stok awal (initial) — dipakai saat produk pertama kali dibuat
 */
const setInitialStock = async ({ product_id, branch_id, store_id, quantity, created_by }, transaction) => {
    return increaseStock({
        product_id, branch_id, store_id,
        quantity, type: "initial",
        notes: "Stok awal produk",
        created_by,
    }, transaction);
};

export { decreaseStock, increaseStock, setInitialStock };
