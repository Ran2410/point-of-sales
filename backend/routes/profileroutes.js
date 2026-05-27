import { Router } from "express";
import { getProfile, updateProfile, changePassword } from "../controllers/profilecontroller.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();
router.use(authenticate);

router.get("/",               getProfile);
router.put("/",               updateProfile);
router.patch("/change-password", changePassword);

export default router;
