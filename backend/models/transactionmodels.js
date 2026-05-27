import sequelize from "../configs/postgresql.js";
import { DataTypes } from "sequelize";

const Transaction = sequelize.define("Transaction", {
    store_id        : { type: DataTypes.INTEGER,        allowNull: false },
    branch_id       : { type: DataTypes.INTEGER,        allowNull: false },
    cashier_id      : { type: DataTypes.INTEGER,        allowNull: false }, // FK → users
    transaction_code: { type: DataTypes.STRING,         allowNull: false, unique: true },
    total_amount    : { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    discount_amount : { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    tax_amount      : { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    grand_total     : { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    payment_method  : {
        type        : DataTypes.ENUM("cash", "qris", "transfer", "card"),
        allowNull   : false,
        defaultValue: "cash",
    },
    amount_paid     : { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    change_amount   : { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    status          : {
        type        : DataTypes.ENUM("completed", "cancelled", "refunded"),
        allowNull   : false,
        defaultValue: "completed",
    },
    notes           : { type: DataTypes.TEXT, allowNull: true },
}, {
    tableName : "transactions",
    timestamps: true,
    updatedAt : false,
    indexes   : [
        { fields: ["store_id", "branch_id"] },
        { fields: ["cashier_id"] },
        { fields: ["createdAt"] },
    ],
});

export default Transaction;
