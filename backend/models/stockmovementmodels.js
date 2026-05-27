import sequelize from "../configs/postgresql.js";
import { DataTypes } from "sequelize";

const MOVEMENT_TYPES = [
    "sale",           // stok berkurang karena penjualan
    "sale_return",    // stok bertambah karena retur pelanggan
    "purchase",       // stok bertambah karena restock/pembelian
    "adjustment_in",  // koreksi manual tambah stok
    "adjustment_out", // koreksi manual kurang stok
    "transfer_in",    // terima stok dari cabang lain
    "transfer_out",   // kirim stok ke cabang lain
    "initial",        // stok awal saat produk pertama dibuat
];

const StockMovement = sequelize.define("StockMovement", {
    store_id      : { type: DataTypes.INTEGER, allowNull: false },
    product_id    : { type: DataTypes.INTEGER, allowNull: false },
    branch_id     : { type: DataTypes.INTEGER, allowNull: false },
    type          : { type: DataTypes.ENUM(...MOVEMENT_TYPES), allowNull: false },
    quantity      : { type: DataTypes.INTEGER, allowNull: false }, // selalu positif
    previous_stock: { type: DataTypes.INTEGER, allowNull: false },
    current_stock : { type: DataTypes.INTEGER, allowNull: false },
    reference_id  : { type: DataTypes.INTEGER, allowNull: true  }, // id transaksi/transfer/dll
    reference_type: { type: DataTypes.STRING,  allowNull: true  }, // "transaction" | "transfer" | "adjustment"
    notes         : { type: DataTypes.TEXT,    allowNull: true  }, // alasan adjustment manual
    created_by    : { type: DataTypes.INTEGER, allowNull: false }, // FK ke users.id
}, {
    tableName : "stock_movements",
    timestamps: false,          // hanya butuh created_at, tidak perlu updated_at
    createdAt : "created_at",   // movement tidak pernah diedit
    updatedAt : false,
});

export { MOVEMENT_TYPES };
export default StockMovement;
