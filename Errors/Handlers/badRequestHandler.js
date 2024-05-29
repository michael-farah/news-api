// Middleware function to handle bad requests
function badRequest (error, req, res, next) {
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

module.exports = badRequest;