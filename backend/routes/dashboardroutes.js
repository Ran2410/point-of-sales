import { Router } from "express";
import { getOwnerDashboardService, getBranchDashboardService } from "../services/dashboard.service.js";
import authenticate from "../middlewares/authenticate.js";
import authorize    from "../middlewares/authorize.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router = Router();
router.use(authenticate);

router.get("/owner",  authorize("owner"),        async (req, res) => {
    try { return sendSuccess(res, 200, "Dashboard owner", await getOwnerDashboardService(req)); }
    catch (e) { console.error(e); return sendError(res, 500, "Terjadi kesalahan"); }
});

router.get("/branch", authorize("branch_owner"), async (req, res) => {
    try { return sendSuccess(res, 200, "Dashboard cabang", await getBranchDashboardService(req)); }
    catch (e) { console.error(e); return sendError(res, 500, "Terjadi kesalahan"); }
});

export default router;
