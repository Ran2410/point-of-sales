import sequelize from "../configs/postgresql.js";
import { DataTypes } from "sequelize";

const TransactionItem = sequelize.define("TransactionItem", {
    transaction_id: { type: DataTypes.INTEGER,        allowNull: false },
    product_id    : { type: DataTypes.INTEGER,        allowNull: true  }, // nullable: produk bisa dihapus
    product_name  : { type: DataTypes.STRING,         allowNull: false }, // snapshot nama saat transaksi
    sku           : { type: DataTypes.STRING,         allowNull: false }, // snapshot SKU
    unit          : { type: DataTypes.STRING,         allowNull: false, defaultValue: "pcs" },
    quantity      : { type: DataTypes.INTEGER,        allowNull: false },
    unit_price    : { type: DataTypes.DECIMAL(15, 2), allowNull: false }, // snapshot harga jual
    discount      : { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    subtotal      : { type: DataTypes.DECIMAL(15, 2), allowNull: false },
}, {
    tableName : "transaction_items",
    timestamps: false,
});

export default TransactionItem;
