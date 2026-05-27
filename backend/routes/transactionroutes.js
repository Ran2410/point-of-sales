import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  voidTransaction,
  getDailySummary,
} from "../controllers/transactioncontroller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = Router();
router.use(authenticate);

router.get(
  "/summary",
  authorize("owner", "branch_owner", "cashier"),
  getDailySummary,
);

router.get("/", authorize("owner", "branch_owner", "cashier"), getTransactions);
router.get(
  "/:id",
  authorize("owner", "branch_owner", "cashier"),
  getTransactionById,
);

router.post("/", authorize("branch_owner", "cashier"), createTransaction);

router.patch("/:id/void", authorize("owner", "branch_owner"), voidTransaction);

export default router;
