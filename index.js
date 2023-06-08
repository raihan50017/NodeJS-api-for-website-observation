//dependencies
const server = require("./lib/server");
const worker = require("./lib/worker");

//module scafolding
const app = {};

app.init = () => {
  server.init();
  worker.init();
};

app.init();
