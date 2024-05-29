function badRequest (err, req, res, next) {
  const errorMessages = {
    "22P02": "Bad request",
    "23503": "Row not found",
    "23502": "Invalid request",
    "23505": "Already exists",
    "42P01": "Table not found",
    "42703": "Column not found",
  };
  const msg = errorMessages[err.code];
  if (msg) {
    err.status = 400;
    err.msg = msg;
  }
  next(err);
};

module.exports = badRequest;