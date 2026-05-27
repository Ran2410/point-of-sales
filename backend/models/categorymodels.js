import sequelize from "../configs/postgresql.js";
import { DataTypes } from "sequelize";

const Category = sequelize.define("Category", {
    store_id   : { type: DataTypes.INTEGER, allowNull: false },
    name       : { type: DataTypes.STRING,  allowNull: false },
    slug       : { type: DataTypes.STRING,  allowNull: false },
    description: { type: DataTypes.TEXT,    allowNull: true  },
    is_active  : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
    tableName: "categories",
    timestamps: true,
    paranoid  : true,  // soft delete
    indexes   : [
        { unique: true, fields: ["store_id", "slug"] }
    ],
});

export default Category;
