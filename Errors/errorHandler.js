const badRequest = require("./Handlers/badRequestHandler");
const customError = require("./Handlers/customErrorHandler");
const internalServerError = require("./Handlers/internalServerHandler");
const notFound = require("./Handlers/notFoundHandler");

function handleErrors(app) {
  app.use(notFound);
  app.use(badRequest);
  app.use(customError);
  app.use(internalServerError);
}

module.exports = handleErrors;
