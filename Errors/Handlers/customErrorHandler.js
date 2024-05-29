function customError(err, req, res, next) {
  // If error has status and message properties, send status code with message
  if (err.status && err.msg)
    return res.status(err.status).send({ msg: err.msg });
  // Otherwise, pass error to next middleware
  next(err);
}

module.exports = customError;
