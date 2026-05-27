import { Router } from "express";
import { getUsers, createUser, updateUser, toggleUserStatus, deleteUser } from "../controllers/usercontroller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize    from "../middlewares/authorize.js";
import { validateCreateUser, validateUpdateUser } from "../middlewares/validators/userValidator.js";

const router = Router();

router.use(authenticate, authorize("owner", "branch_owner"));

router.get   ("/",                   getUsers);
router.post  ("/",                   validateCreateUser, createUser);
router.put   ("/:id",                validateUpdateUser, updateUser);
router.patch ("/:id/toggle-status",  toggleUserStatus);
router.delete("/:id",                deleteUser);

export default router;
