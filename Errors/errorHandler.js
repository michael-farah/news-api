const badRequest = require("./Handlers/badRequestHandler");
const customError = require("./Handlers/customErrorHandler");
const notFound = require("./Handlers/notFoundHandler");

function handleErrors(app) {
  app.use(notFound);
  app.use(badRequest);
  app.use(customError);
}

module.exports = handleErrors;