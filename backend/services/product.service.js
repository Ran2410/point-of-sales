import { Op } from "sequelize";
import sequelize from "../configs/postgresql.js";
import {
  Product,
  Category,
  ProductStock,
  Branch,
  StockMovement,
  User,
} from "../models/relations.js";
import AppError from "../utils/AppError.js";
import {
  setInitialStock,
  increaseStock,
  decreaseStock,
} from "../utils/stockHelper.js";

const toSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const buildProductInclude = (branchId = null) => [
  { model: Category, as: "category", attributes: ["id", "name"] },
  {
    model: ProductStock,
    as: "stocks",

    ...(branchId ? { where: { branch_id: branchId }, required: false } : {}),
    include: [
      { model: Branch, as: "branch", attributes: ["id", "name", "code"] },
    ],
  },
];

const getProductsService = async (req) => {
  const { store_id, branch_id, role } = req.user;
  const { search, category_id, is_active, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const where = { store_id };
  if (search)
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { sku: { [Op.iLike]: `%${search}%` } },
    ];
  if (category_id) where.category_id = category_id;
  if (is_active !== undefined) where.is_active = is_active === "true";

  const scopedBranchId =
    role === "branch_owner" || role === "cashier" ? branch_id : null;

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: buildProductInclude(scopedBranchId),
    limit: parseInt(limit),
    offset,
    order: [["name", "ASC"]],
    distinct: true,
  });

  return {
    data: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  };
};

const getProductByIdService = async (id, req) => {
  const { branch_id, role } = req.user;
  const scopedBranchId =
    role === "branch_owner" || role === "cashier" ? branch_id : null;

  const product = await Product.findOne({
    where: { id, store_id: req.user.store_id },
    include: buildProductInclude(scopedBranchId),
  });
  if (!product) throw new AppError("Produk tidak ditemukan", 404);
  return product;
};

const createProductService = async (body, req) => {
  const { store_id, id: created_by } = req.user;
  const {
    name,
    category_id,
    sku,
    barcode,
    description,
    unit,
    cost_price,
    selling_price,
    image,
    is_active,
    initial_stocks,
  } = body;

  const slug = toSlug(name);

  const [slugExists, skuExists] = await Promise.all([
    Product.findOne({ where: { store_id, slug } }),
    Product.findOne({ where: { store_id, sku } }),
  ]);
  if (slugExists)
    throw new AppError(`Produk dengan nama '${name}' sudah ada`, 409);
  if (skuExists) throw new AppError(`SKU '${sku}' sudah digunakan`, 409);

  if (barcode) {
    const barcodeExists = await Product.findOne({
      where: { store_id, barcode },
    });
    if (barcodeExists)
      throw new AppError(`Barcode '${barcode}' sudah digunakan`, 409);
  }

  const result = await sequelize.transaction(async (t) => {
    const product = await Product.create(
      {
        store_id,
        category_id,
        name,
        slug,
        sku,
        barcode,
        description,
        unit,
        cost_price,
        selling_price,
        image,
        is_active: is_active ?? true,
      },
      { transaction: t },
    );

    if (Array.isArray(initial_stocks) && initial_stocks.length > 0) {
      for (const s of initial_stocks) {
        await ProductStock.create(
          {
            product_id: product.id,
            branch_id: s.branch_id,
            stock: 0,
            minimum_stock: s.minimum_stock ?? 0,
          },
          { transaction: t },
        );

        if (s.stock > 0) {
          await setInitialStock(
            {
              product_id: product.id,
              branch_id: s.branch_id,
              store_id,
              quantity: s.stock,
              created_by,
            },
            t,
          );
        }
      }
    }

    return product;
  });

  return getProductByIdService(result.id, req);
};

const updateProductService = async (id, body, req) => {
  const { store_id } = req.user;
  const product = await Product.findOne({ where: { id, store_id } });
  if (!product) throw new AppError("Produk tidak ditemukan", 404);

  const {
    name,
    category_id,
    sku,
    barcode,
    description,
    unit,
    cost_price,
    selling_price,
    image,
    is_active,
  } = body;
  const updates = {
    category_id,
    description,
    unit,
    cost_price,
    selling_price,
    image,
    is_active,
  };

  if (name && name !== product.name) {
    const slug = toSlug(name);
    const exists = await Product.findOne({
      where: { store_id, slug, id: { [Op.ne]: id } },
    });
    if (exists)
      throw new AppError(`Produk dengan nama '${name}' sudah ada`, 409);
    updates.name = name;
    updates.slug = slug;
  }

  if (sku && sku !== product.sku) {
    const exists = await Product.findOne({
      where: { store_id, sku, id: { [Op.ne]: id } },
    });
    if (exists) throw new AppError(`SKU '${sku}' sudah digunakan`, 409);
    updates.sku = sku;
  }

  if (barcode && barcode !== product.barcode) {
    const exists = await Product.findOne({
      where: { store_id, barcode, id: { [Op.ne]: id } },
    });
    if (exists) throw new AppError(`Barcode '${barcode}' sudah digunakan`, 409);
    updates.barcode = barcode;
  }

  await product.update(updates);
  return getProductByIdService(id, req);
};

const deleteProductService = async (id, req) => {
  const product = await Product.findOne({
    where: { id, store_id: req.user.store_id },
  });
  if (!product) throw new AppError("Produk tidak ditemukan", 404);
  await product.destroy(); 
};

const adjustStockService = async (
  id,
  { branch_id, type, quantity, notes },
  req,
) => {
  const { store_id, id: created_by } = req.user;

  const product = await Product.findOne({ where: { id, store_id } });
  if (!product) throw new AppError("Produk tidak ditemukan", 404);

  const INCREASE_TYPES = [
    "purchase",
    "adjustment_in",
    "transfer_in",
    "sale_return",
  ];
  const DECREASE_TYPES = ["adjustment_out", "transfer_out"];

  const result = await sequelize.transaction(async (t) => {
    if (INCREASE_TYPES.includes(type)) {
      return increaseStock(
        {
          product_id: id,
          branch_id,
          store_id,
          quantity,
          type,
          notes,
          created_by,
          reference_type: "adjustment",
        },
        t,
      );
    } else if (DECREASE_TYPES.includes(type)) {
      return decreaseStock(
        {
          product_id: id,
          branch_id,
          store_id,
          quantity,
          type,
          notes,
          created_by,
          reference_type: "adjustment",
        },
        t,
      );
    } else {
      throw new AppError(
        `Tipe adjustment '${type}' tidak valid untuk operasi manual`,
        400,
      );
    }
  });

  return { product_id: id, branch_id, new_stock: result };
};

const getStockMovementsService = async (id, req) => {
  const { store_id, branch_id: userBranchId, role } = req.user;
  const { branch_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const product = await Product.findOne({ where: { id, store_id } });
  if (!product) throw new AppError("Produk tidak ditemukan", 404);

  const where = { product_id: id, store_id };

  if (role === "branch_owner") {
    where.branch_id = userBranchId;
  } else if (branch_id) {
    where.branch_id = branch_id;
  }

  const { count, rows } = await StockMovement.findAndCountAll({
    where,
    include: [
      { model: Branch, as: "branch", attributes: ["id", "name"] },
      { model: User, as: "creator", attributes: ["id", "name", "role"] },
    ],
    limit: parseInt(limit),
    offset,
    order: [["created_at", "DESC"]],
  });

  return {
    data: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  };
};

export {
  getProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  adjustStockService,
  getStockMovementsService,
};
