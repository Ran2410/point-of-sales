import { Router } from "express";
import {
  getDashboardStats,
  getAllStores,
  getStoreById,
  createStore,
  approveStore,
  rejectStore,
  toggleStoreStatus,
  updateStore,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  resetUserPassword,
  updateUser,
  deleteUser,
} from "../controllers/admincontroller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import {
  validateCreateStore,
  validateUpdateUser,
  validateUpdateStore,
} from "../middlewares/validators/adminValidator.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/dashboard", getDashboardStats);

router.get("/stores", getAllStores);
router.post("/stores", validateCreateStore, createStore);
router.get("/stores/:id", getStoreById);
router.put("/stores/:id", validateUpdateStore, updateStore);
router.patch("/stores/:id/approve", approveStore);
router.patch("/stores/:id/reject", rejectStore);
router.patch("/stores/:id/toggle-status", toggleStoreStatus);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", validateUpdateUser, updateUser);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.patch("/users/:id/reset-password", resetUserPassword);
router.delete("/users/:id", deleteUser);

export default router;
