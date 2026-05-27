import Store from "./storemodels.js";
import Branch from "./branchmodels.js";
import User from "./usermodels.js";
import Category from "./categorymodels.js";
import Product from "./productmodels.js";
import ProductStock from "./productstockmodels.js";
import StockMovement from "./stockmovementmodels.js";
import Transaction from "./transactionmodels.js";
import TransactionItem from "./transactionitemmodels.js";

Store.hasMany(Branch, {
  foreignKey: "store_id",
  as: "branches",
  onDelete: "CASCADE",
});
Branch.belongsTo(Store, { foreignKey: "store_id", as: "store" });

Store.hasMany(User, {
  foreignKey: "store_id",
  as: "users",
  onDelete: "CASCADE",
});
User.belongsTo(Store, { foreignKey: "store_id", as: "store" });

Branch.hasMany(User, { foreignKey: "branch_id", as: "users" });
User.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Store.hasMany(Category, {
  foreignKey: "store_id",
  as: "categories",
  onDelete: "CASCADE",
});
Category.belongsTo(Store, { foreignKey: "store_id", as: "store" });

Store.hasMany(Product, {
  foreignKey: "store_id",
  as: "products",
  onDelete: "CASCADE",
});
Product.belongsTo(Store, { foreignKey: "store_id", as: "store" });

Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

Product.hasMany(ProductStock, {
  foreignKey: "product_id",
  as: "stocks",
  onDelete: "CASCADE",
});
ProductStock.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Branch.hasMany(ProductStock, { foreignKey: "branch_id", as: "stocks" });
ProductStock.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Product.hasMany(StockMovement, { foreignKey: "product_id", as: "movements" });
StockMovement.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Branch.hasMany(StockMovement, { foreignKey: "branch_id", as: "movements" });
StockMovement.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Store.hasMany(StockMovement, { foreignKey: "store_id", as: "movements" });
StockMovement.belongsTo(Store, { foreignKey: "store_id", as: "store" });

User.hasMany(StockMovement, {
  foreignKey: "created_by",
  as: "stock_movements",
});
StockMovement.belongsTo(User, { foreignKey: "created_by", as: "creator" });

Store.hasMany(Transaction, { foreignKey: "store_id", as: "transactions" });
Transaction.belongsTo(Store, { foreignKey: "store_id", as: "store" });

Branch.hasMany(Transaction, { foreignKey: "branch_id", as: "transactions" });
Transaction.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

User.hasMany(Transaction, { foreignKey: "cashier_id", as: "transactions" });
Transaction.belongsTo(User, { foreignKey: "cashier_id", as: "cashier" });

Transaction.hasMany(TransactionItem, {
  foreignKey: "transaction_id",
  as: "items",
  onDelete: "CASCADE",
});
TransactionItem.belongsTo(Transaction, {
  foreignKey: "transaction_id",
  as: "transaction",
});

Product.hasMany(TransactionItem, {
  foreignKey: "product_id",
  as: "transaction_items",
});
TransactionItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export {
  Store,
  Branch,
  User,
  Category,
  Product,
  ProductStock,
  StockMovement,
  Transaction,
  TransactionItem,
};
