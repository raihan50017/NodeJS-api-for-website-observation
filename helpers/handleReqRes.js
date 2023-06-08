//dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const {
  notFoundHandler,
} = require("../handlers/routeHandlers/notFoundHandler");
const { parseJSON } = require("./utilities");

// Handle Response
const handleReqRes = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const queryStringObject = parsedUrl.query;
  const method = req.method.toLowerCase();
  const headers = req.headers;

  const requestProperties = {
    parsedUrl,
    path,
    trimmedPath,
    queryStringObject,
    method,
    headers,
  };

  const choseHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  const decoder = new StringDecoder();

  let realData = "";

  req.on("data", (buffer) => {
    realData += decoder.write(buffer);
  });

  req.on("end", () => {
    realData += decoder.end();
    requestProperties.body = parseJSON(realData);
    choseHandler(requestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};
      const payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

module.exports = handleReqRes;
