const { checkHandler } = require("./handlers/routeHandlers/checkHandler");
const { samplerHandler } = require("./handlers/routeHandlers/sampleHandler");
const { tokenHandler } = require("./handlers/routeHandlers/tokenHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");

const routes = {
  sample: samplerHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};

module.exports = routes;
