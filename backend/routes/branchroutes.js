import { Router } from "express";
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  toggleBranchStatus,
  deleteBranch,
} from "../controllers/branchcontroller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import {
  validateCreateBranch,
  validateUpdateBranch,
} from "../middlewares/validators/branchValidator.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("owner", "branch_owner", "cashier"), getBranches);
router.get(
  "/:id",
  authorize("owner", "branch_owner", "cashier"),
  getBranchById,
);

router.post("/", authorize("owner"), validateCreateBranch, createBranch);
router.put("/:id", authorize("owner"), validateUpdateBranch, updateBranch);
router.patch("/:id/toggle-status", authorize("owner"), toggleBranchStatus);
router.delete("/:id", authorize("owner"), deleteBranch);

export default router;
