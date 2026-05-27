import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
} from "../controllers/authcontroller.js";
import authenticate from "../middlewares/authenticate.js";
import {
  validateLogin,
  validateRegister,
} from "../middlewares/validators/authValidator.js";

const router = Router();

router.post("/register",      validateRegister, register);
router.post("/login",         validateLogin,    login);
router.post("/refresh-token", refreshToken);
router.post("/logout",        authenticate,     logout);
router.get ("/me",            authenticate,     getMe);

export default router;
