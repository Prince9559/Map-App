const errorHandler = (err, req, res, next) => {
    console.error("ERROR DETAILS:", err);

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        success: false,
        message:
            typeof err.message === "string"
                ? err.message
                : "Something went wrong",
        error: process.env.NODE_ENV === "development"
            ? String(err.stack || err)
            : undefined
    });
};

module.exports = errorHandler;