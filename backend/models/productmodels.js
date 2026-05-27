import sequelize from "../configs/postgresql.js";
import { DataTypes } from "sequelize";

const Product = sequelize.define("Product", {
    store_id     : { type: DataTypes.INTEGER,  allowNull: false },
    category_id  : { type: DataTypes.INTEGER,  allowNull: true  },
    name         : { type: DataTypes.STRING,   allowNull: false },
    slug         : { type: DataTypes.STRING,   allowNull: false },
    sku          : { type: DataTypes.STRING,   allowNull: false },
    barcode      : { type: DataTypes.STRING,   allowNull: true  },
    description  : { type: DataTypes.TEXT,     allowNull: true  },
    unit         : { type: DataTypes.STRING,   allowNull: false, defaultValue: "pcs" },
    cost_price   : { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    selling_price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    image        : { type: DataTypes.STRING,   allowNull: true  },
    is_active    : { type: DataTypes.BOOLEAN,  allowNull: false, defaultValue: true },
    deleted_at   : { type: DataTypes.DATE,     allowNull: true  },
}, {
    tableName: "products",
    timestamps: true,
    paranoid : true,  // soft delete — gunakan deleted_at
    indexes  : [
        { unique: true, fields: ["store_id", "slug"]    },
        { unique: true, fields: ["store_id", "sku"]     },

    ],
});

export default Product;
