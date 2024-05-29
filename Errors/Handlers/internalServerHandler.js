function internalServerError(error, req, res, next) {
  res.status(500).send({ msg: "Internal Server Error" });
}

module.exports = internalServerError;
