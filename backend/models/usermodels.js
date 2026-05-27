import sequelize from "../configs/postgresql.js";
import { DataTypes } from "sequelize";

const User = sequelize.define("User", {
    name     : { type: DataTypes.STRING,  allowNull: false },
    email    : { type: DataTypes.STRING,  allowNull: false, unique: true },
    password : { type: DataTypes.STRING,  allowNull: false },
    role     : {
        type        : DataTypes.ENUM("admin", "owner", "branch_owner", "cashier"),
        allowNull   : false,
        defaultValue: "owner",
    },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    store_id : { type: DataTypes.INTEGER, allowNull: true  },
    branch_id: { type: DataTypes.INTEGER, allowNull: true  },
}, {
    tableName: "users",
    timestamps: true,
    paranoid  : true,  // soft delete
})

export default User;
