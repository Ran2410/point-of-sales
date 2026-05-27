/**
 * Generate barcode EAN-13 yang valid.
 *
 * Format EAN-13:
 *   - 12 digit angka + 1 digit check digit (dihitung otomatis)
 *   - Prefix "899" = Indonesia
 *
 * Contoh output: "8991234567890"
 */
const generateEAN13 = () => {
    // Prefix Indonesia (899) + 9 digit random
    const prefix = "899";
    const random = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
    const digits = prefix + random; // 12 digit

    // Hitung check digit EAN-13
    const checkDigit = calcEAN13CheckDigit(digits);
    return digits + checkDigit;
};

/**
 * Hitung check digit EAN-13 dari 12 digit pertama.
 * Algoritma: alternating weight 1 dan 3, modulo 10.
 */
const calcEAN13CheckDigit = (digits12) => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(digits12[i], 10);
        sum += i % 2 === 0 ? digit : digit * 3;
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
};

/**
 * Validasi apakah string adalah EAN-13 yang valid.
 */
const isValidEAN13 = (barcode) => {
    if (!/^\d{13}$/.test(barcode)) return false;
    const expected = calcEAN13CheckDigit(barcode.slice(0, 12));
    return parseInt(barcode[12], 10) === expected;
};

export { generateEAN13, isValidEAN13 };
