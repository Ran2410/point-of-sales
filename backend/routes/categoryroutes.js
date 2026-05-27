import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categorycontroller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import { validateCreateCategory } from "../middlewares/validators/productValidator.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("owner", "branch_owner", "cashier"), getCategories);
router.get(
  "/:id",
  authorize("owner", "branch_owner", "cashier"),
  getCategoryById,
);

router.post("/", authorize("owner"), validateCreateCategory, createCategory);
router.put("/:id", authorize("owner"), updateCategory);
router.delete("/:id", authorize("owner"), deleteCategory);

export default router;
