import sequelize from "../configs/postgresql.js";
import { DataTypes } from "sequelize";

const Branch = sequelize.define("Branch", {
    name     : { type: DataTypes.STRING,  allowNull: false },
    code     : { type: DataTypes.STRING,  allowNull: false, unique: true },
    address  : { type: DataTypes.STRING,  allowNull: false },
    phone    : { type: DataTypes.STRING,  allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    store_id : { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: "branches",
    timestamps: true,
    paranoid  : true,  // soft delete
})

export default Branch;