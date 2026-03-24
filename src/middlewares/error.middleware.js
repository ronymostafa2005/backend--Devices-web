// Global Error Handler (Production Ready)

export const errorMiddleware = (err, req, res, next) => {
  // if the error has a statusCode use it, otherwise use 500
  const statusCode = err.statusCode || 500;

  // error message
  const message = err.message || "Internal Server Error";

  // response unified
  res.status(statusCode).json({
    success: false,
    message,

    // in development show more details
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

