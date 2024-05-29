function notFound(req, res, next) {
  const err = new Error("Path not found");
  err.status = 404;
  err.msg = "Path not found";
  next(err);
}

module.exports = notFound;
  