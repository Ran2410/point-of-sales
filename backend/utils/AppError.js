/**
 * Custom error class untuk semua error yang bisa diprediksi.
 * Dilempar dari layer service, ditangkap di controller.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
