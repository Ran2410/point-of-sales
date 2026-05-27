/**
 * Middleware: role-based authorization
 *
 * Penggunaan:
 *   authorize("owner")                        — hanya owner
 *   authorize("owner", "branch_owner")        — owner atau branch_owner
 *   authorize("owner", "branch_owner", "cashier") — semua role
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Akses ditolak. Role '${req.user.role}' tidak diizinkan.`
            });
        }

        next();
    };
};

export default authorize;
