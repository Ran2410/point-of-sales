import multer from "multer";
import path   from "path";
import fs     from "fs";

// Pastikan folder uploads ada
const uploadDir = "uploads/products";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename   : (req, file, cb) => {
        const ext      = path.extname(file.originalname).toLowerCase();
        const filename = `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext     = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan"), false);
    }
};

export const uploadProductImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
}).single("image");
