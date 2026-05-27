import express from "express";
import cors    from "cors";
import helmet  from "helmet";
import rateLimit from "express-rate-limit";
import path    from "path";
import { fileURLToPath } from "url";
import sequelize from "./configs/postgresql.js";
import "dotenv/config";
import seederUser        from "./seeders/userseeders.js";
import "./models/relations.js";
import authRoutes        from "./routes/authroutes.js";
import adminRoutes       from "./routes/adminroutes.js";
import branchRoutes      from "./routes/branchroutes.js";
import userRoutes        from "./routes/userroutes.js";
import categoryRoutes    from "./routes/categoryroutes.js";
import productRoutes     from "./routes/productroutes.js";
import transactionRoutes from "./routes/transactionroutes.js";
import profileRoutes     from "./routes/profileroutes.js";
import dashboardRoutes   from "./routes/dashboardroutes.js";

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin     : process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Login: max 10 percobaan per 15 menit per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max     : 10,
    message : { success: false, message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." },
    standardHeaders: true,
    legacyHeaders  : false,
});

// API umum: max 200 request per menit per IP
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max     : 200,
    message : { success: false, message: "Terlalu banyak request. Coba lagi sebentar." },
    standardHeaders: true,
    legacyHeaders  : false,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth/login", loginLimiter);   // rate limit khusus login
app.use("/api",            apiLimiter);     // rate limit semua API

app.use("/api/auth",         authRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/branches",     branchRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/categories",   categoryRoutes);
app.use("/api/products",     productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/profile",      profileRoutes);
app.use("/api/dashboard",    dashboardRoutes);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database has successfully connected");

    await sequelize.sync({ alter: true });
    console.log("Database synchronized");

    await seederUser();
    console.log("User seeder has been created");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

startServer();
