// Middleware function to handle paths that are not found
exports.notFound = (req, res) =>
  res.status(404).send({ msg: "Path not found" });

// Middleware function to handle bad requests
exports.badRequest = (error, req, res, next) => {
  // Map error codes to corresponding error messages
  const errorMessages = {
    "22P02": "Bad request",
    "23503": "Row not found",
    "23502": "Invalid request",
    "23505": "Already exists",
    "42P01": "Table not found",
    "42703": "Column not found",
  };
  // Extract error message from error code
  const msg = errorMessages[error.code];
  // If error message exists, send status code 400 with error message
  if (msg) return res.status(400).send({ msg });
  // If error message does not exist, pass error to next middleware
  next(error);
};

// Middleware function to handle custom errors
exports.customError = (err, req, res, next) => {
  // If error has status and message properties, send status code with message
  if (err.status && err.msg)
    return res.status(err.status).send({ msg: err.msg });
  // Otherwise, pass error to next middleware
  next(err);
};

// Middleware function to handle internal server errors
exports.internalServerError = (error, req, res, next) =>
  res.status(500).send({ msg: "Internal Server Error" });
