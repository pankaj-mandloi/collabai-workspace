import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If not ApiError instance, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || []);
  }

  console.error(`❌ [${error.statusCode}] ${error.message}`);

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export default errorMiddleware;