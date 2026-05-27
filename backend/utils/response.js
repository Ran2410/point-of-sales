/**
 * Format response JSON yang konsisten di seluruh aplikasi.
 */

const sendSuccess = (res, statusCode = 200, message = "OK", data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const sendError = (res, statusCode = 500, message = "Internal Server Error") => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null,
    });
};

export { sendSuccess, sendError };
