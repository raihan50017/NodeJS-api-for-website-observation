const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  console.log(requestProperties);
  callback(400, {
    message: "Your request URL not found",
  });
};

module.exports = handler;
