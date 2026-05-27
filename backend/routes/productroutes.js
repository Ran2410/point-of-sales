import { Router } from "express";
import {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, adjustStock, getStockMovements, uploadImage,
} from "../controllers/productcontroller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize    from "../middlewares/authorize.js";
import { validateCreateProduct, validateAdjustStock } from "../middlewares/validators/productValidator.js";
import { uploadProductImage } from "../middlewares/upload.js";

const router = Router();
router.use(authenticate);

router.get("/",    authorize("owner", "branch_owner", "cashier"), getProducts);
router.get("/:id", authorize("owner", "branch_owner", "cashier"), getProductById);
router.get("/:id/movements",   authorize("owner", "branch_owner"), getStockMovements);
router.post("/:id/adjust-stock", authorize("owner", "branch_owner"), validateAdjustStock, adjustStock);

// Upload gambar produk
router.post("/:id/image", authorize("owner"), (req, res, next) => {
    uploadProductImage(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        next();
    });
}, uploadImage);

router.post  ("/",    authorize("owner"), validateCreateProduct, createProduct);
router.put   ("/:id", authorize("owner"), updateProduct);
router.delete("/:id", authorize("owner"), deleteProduct);

export default router;
