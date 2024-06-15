function handleErrors(err, req, res, next) {
  const errorMessages = {
    "22P02": "The format of the request is invalid.",
    "23503": "The referenced row could not be found.",
    "23502": "A required field is missing.",
    "23505": "A record with this information already exists.",
    "42P01": "The specified table does not exist.",
    "42703": "The specified column does not exist.",
  };

  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }

  if (err.message && !err.msg) {
    err.msg = err.message;
  }

  if (!err.msg && errorMessages[err.code]) {
    err.status = 400;
    err.msg = errorMessages[err.code];
  }

  if (err.status && !err.msg) {
    const defaultMessages = {
      400: "Bad Request: The server could not understand the request due to invalid syntax.",
      403: "Forbidden: You do not have permission to access this resource.",
      404: "Not Found: The requested resource could not be found.",
      500: "Internal Server Error.",
    };

    err.msg =
      defaultMessages[err.status] ||
      "An unexpected error occurred. Please try again later.";
  }

  if (!err.status) {
    err.status = 500;
    err.msg = "Internal Server Error.";
  }

  res.status(err.status).send({ msg: err.msg });
}

module.exports = handleErrors;