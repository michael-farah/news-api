// Function to handle paths that are not found
function notFound(req, res) {
  res.status(404).send({ msg: "Path not found" });
}

module.exports = notFound;
