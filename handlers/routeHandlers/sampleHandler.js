const handler = {};

handler.samplerHandler = (requestProperties, callback) => {
  console.log(requestProperties);
  callback(200, {
    message: "This is our sample handler",
  });
};

module.exports = handler;
