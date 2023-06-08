// Dependencies
const http = require("http");
const handleReqRes = require("../helpers/handleReqRes");
const environment = require("../helpers/environments");
const data = require("./data");
const { sendTwilioSms } = require("../helpers/notifications");

// App object - module scafolding
const server = {};

server.createServer = () => {
  const server = http.createServer(handleReqRes);
  server.listen(environment.port, () => {
    console.log(`SERVER IS RUNNING ON PORT ${environment.port}`);
  });
};

// Start the server function
server.init = () => {
  server.createServer();
};

module.exports = server;
