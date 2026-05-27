import { Store } from "../models/relations.js";

/**
 * Generate store code dari nama toko.
 * Logika:
 *   1. Ambil huruf kapital dari setiap kata → "Toko Mineral" → "TM"
 *   2. Jika hanya 1 kata, ambil 4 huruf pertama → "Mineral" → "MINE"
 *   3. Jika code sudah ada di DB, tambahkan angka suffix → "TM", "TM2", "TM3"
 *
 * Contoh:
 *   "Toko Mineral"     → "TKMN"  (ambil 2 huruf per kata jika kata ≤ 3)
 *   "Toko"             → "TOKO"
 *   "Toko Budi Jaya"   → "TBJ"
 */
const generateStoreCode = async (storeName) => {
    const words = storeName.trim().toUpperCase().split(/\s+/);

    let baseCode;

    if (words.length === 1) {
        // Satu kata → ambil 4 huruf pertama
        baseCode = words[0].replace(/[^A-Z]/g, "").slice(0, 4);
    } else if (words.length === 2) {
        // Dua kata → ambil 2 huruf per kata → "TOKO MINERAL" → "TKMN"
        baseCode = words.map(w => w.replace(/[^A-Z]/g, "").slice(0, 2)).join("");
    } else {
        // Tiga kata atau lebih → ambil 1 huruf pertama tiap kata
        baseCode = words.map(w => w.replace(/[^A-Z]/g, "")[0] || "").join("");
    }

    // Pastikan tidak kosong
    if (!baseCode) {
        baseCode = "STR";
    }

    // Cek keunikan di DB, tambah suffix angka jika sudah ada
    let code     = baseCode;
    let counter  = 2;

    while (true) {
        const exists = await Store.findOne({ where: { code } });
        if (!exists) break;
        code = `${baseCode}${counter}`;
        counter++;
    }

    return code;
};

export { generateStoreCode };
