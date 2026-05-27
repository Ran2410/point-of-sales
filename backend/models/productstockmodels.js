import sequelize from "../configs/postgresql.js";
import { DataTypes } from "sequelize";

const ProductStock = sequelize.define("ProductStock", {
    product_id   : { type: DataTypes.INTEGER, allowNull: false },
    branch_id    : { type: DataTypes.INTEGER, allowNull: false },
    stock        : { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    minimum_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
    tableName: "product_stocks",
    timestamps: true,
    indexes  : [
        { unique: true, fields: ["product_id", "branch_id"] }, // satu record per produk per cabang
    ],
});

export default ProductStock;
