import ApiError from "../utils/ApiError.js";

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      const errors = error.errors?.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      next(new ApiError(400, "Validation failed", errors));
    }
  };
};

export default validate;