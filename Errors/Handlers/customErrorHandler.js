function customError(err, req, res, next) {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  } else {
    return res.status(500).send({ msg: "Internal Server Error" });
  }
}

module.exports = customError;