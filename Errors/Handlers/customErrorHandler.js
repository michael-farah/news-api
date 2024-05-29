function customError(err, req, res, next) {
  if (err.status && err.msg)
    return res.status(err.status).send({ msg: err.msg });
  next(err);
}

module.exports = customError;