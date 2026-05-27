import jwt            from "jsonwebtoken";
import { User, Branch, Store } from "../models/relations.js";
import tokenBlacklist from "../utils/tokenBlacklist.js";
import { sendError }  from "../utils/response.js";

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, 401, "Token tidak ditemukan");
        }

        const token = authHeader.split(" ")[1];

        if (await tokenBlacklist.has(token)) {
            return sendError(res, 401, "Token sudah tidak valid, silahkan login kembali");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({
            where  : { id: decoded.id, is_active: true },
            include: [
                { model: Store,  as: "store",  attributes: ["id", "name", "is_active"] },
                { model: Branch, as: "branch", attributes: ["id", "name", "is_active"] },
            ]
        });

        if (!user) {
            return sendError(res, 401, "User tidak ditemukan atau tidak aktif");
        }

        if (user.role !== "admin") {
            if (!user.store || !user.store.is_active) {
                return sendError(res, 403, "Toko tidak aktif");
            }
        }

        req.user = {
            id       : user.id,
            name     : user.name,
            email    : user.email,
            role     : user.role,
            store_id : user.store_id,
            branch_id: user.branch_id,
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return sendError(res, 401, "Token sudah kadaluarsa");
        }
        if (error.name === "JsonWebTokenError") {
            return sendError(res, 401, "Token tidak valid");
        }
        next(error);
    }
};

export default authenticate;
