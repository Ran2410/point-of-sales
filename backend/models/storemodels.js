import sequelize from "../configs/postgresql.js";
import { DataTypes } from "sequelize";

const Store = sequelize.define("Store", {
    name       : { type: DataTypes.STRING,  allowNull: false },
    code       : { type: DataTypes.STRING,  allowNull: false, unique: true },
    is_active  : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
    tableName: "stores",
    timestamps: true,
    paranoid  : true,  // soft delete
})

export default Store;
