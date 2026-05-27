import { Branch } from "../models/relations.js";

/**
 * Middleware: tenant isolation
 *
 * Memastikan setiap request hanya bisa mengakses data dalam store_id miliknya.
 * Juga memvalidasi branch_id jika ada di params/body.
 *
 * Gunakan SETELAH authenticate.
 */
const tenantIsolation = async (req, res, next) => {
  try {
    const { store_id, branch_id: userBranchId, role } = req.user;

    const paramBranchId = req.params.branchId || req.params.branch_id;

    if (paramBranchId) {
      const branch = await Branch.findOne({
        where: { id: paramBranchId, store_id },
      });

      if (!branch) {
        return res.status(403).json({
          message: "Akses ditolak. Branch tidak ditemukan dalam toko Anda.",
        });
      }

      if (
        (role === "branch_owner" || role === "cashier") &&
        branch.id !== userBranchId
      ) {
        return res.status(403).json({
          message:
            "Akses ditolak. Anda hanya bisa mengakses branch Anda sendiri.",
        });
      }

      req.branch = branch;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: inject store_id ke where clause secara otomatis
 * Gunakan di controller untuk memastikan query selalu terfilter by tenant.
 *
 * Contoh penggunaan di controller:
 *   const where = tenantScope(req);
 *   const products = await Product.findAll({ where });
 */
const tenantScope = (req) => {
  return { store_id: req.user.store_id };
};

/**
 * Helper: scope untuk branch_owner dan cashier
 * Otomatis filter by store_id DAN branch_id jika role bukan owner.
 *
 * Contoh penggunaan di controller:
 *   const where = branchScope(req);
 *   const transactions = await Transaction.findAll({ where });
 */
const branchScope = (req) => {
  const { store_id, branch_id, role } = req.user;

  if (role === "owner") {
    return { store_id };
  }

  return { store_id, branch_id };
};

export { tenantIsolation, tenantScope, branchScope };
