const {
  hash,
  parseJSON,
  createRandomString,
} = require("../../helpers/utilities");
const data = require("../../lib/data");
const tokenHandler = require("../../handlers/routeHandlers/tokenHandler");
const environments = require("../../helpers/environments");

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._check = {};

handler._check.post = (requestedProperties, callback) => {
  const protocol =
    typeof requestedProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestedProperties.body.protocol) > -1
      ? requestedProperties.body.protocol
      : false;

  const url =
    typeof requestedProperties.body.url === "string" &&
    requestedProperties.body.url.trim().length > 0
      ? requestedProperties.body.url
      : false;

  const method =
    typeof requestedProperties.body.method === "string" &&
    ["POST", "GET", "PUT", "DELETE"].indexOf(requestedProperties.body.method) >
      -1
      ? requestedProperties.body.method
      : false;

  const successCodes =
    typeof requestedProperties.body.successCodes === "object" &&
    requestedProperties.body.successCodes instanceof Array
      ? requestedProperties.body.successCodes
      : false;

  const timeOutSeconds =
    typeof requestedProperties.body.timeOutSeconds === "number" &&
    requestedProperties.body.timeOutSeconds % 1 === 0 &&
    requestedProperties.body.timeOutSeconds >= 1 &&
    requestedProperties.body.timeOutSeconds <= 5
      ? requestedProperties.body.timeOutSeconds
      : false;

  if (protocol && url && method && successCodes && timeOutSeconds) {
    const token =
      typeof requestedProperties.headers.token === "string"
        ? requestedProperties.headers.token
        : false;
    if (token) {
      data.read("tokens", token, (err, tokenData) => {
        if (!err && tokenData) {
          const phone = parseJSON(tokenData).phone;

          data.read("users", phone, (err, userData) => {
            if (!err && userData) {
              tokenHandler._tokens.verify(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                  let userObject = parseJSON(userData);
                  let userChecks =
                    typeof userObject.checks === "object" &&
                    userObject.checks instanceof Array
                      ? userObject.checks
                      : [];
                  if (userChecks.length < environments.maxChecks) {
                    const checkId = createRandomString(20);
                    const checkObject = {
                      id: checkId,
                      phone,
                      protocol,
                      url,
                      method,
                      successCodes,
                      timeOutSeconds,
                    };

                    data.create("checks", checkId, checkObject, (err) => {
                      if (!err) {
                        userObject.checks = userChecks;
                        userObject.checks.push(checkId);

                        data.update("users", phone, userObject, (err) => {
                          if (!err) {
                            callback(200, checkObject);
                          } else {
                            callback(500, {
                              error: "There was an server side error",
                            });
                          }
                        });
                      } else {
                        callback(500, {
                          error: "There was an server side error",
                        });
                      }
                    });
                  } else {
                    callback(403, {
                      error: "Checks limit already exit",
                    });
                  }
                } else {
                  callback(403, {
                    error: "Authentication failed",
                  });
                }
              });
            } else {
              callback(403, {
                error: "User not found",
              });
            }
          });
        } else {
          callback(400, {
            error: "Authentication failed",
          });
        }
      });
    } else {
      callback(400, {
        error: "Authentication failed",
      });
    }
  } else {
    callback(400, {
      error: "You have an error in your request",
    });
  }
};

handler._check.get = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.queryStringObject.id === "string" &&
    requestedProperties.queryStringObject.id.trim().length === 20
      ? requestedProperties.queryStringObject.id
      : false;

  if (id) {
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const checkObject = parseJSON(checkData);
        const token =
          typeof requestedProperties.headers.token === "string"
            ? requestedProperties.headers.token
            : false;
        tokenHandler._tokens.verify(token, checkObject.phone, (tokenId) => {
          if (tokenId) {
            callback(200, checkObject);
          } else {
            callback(403, {
              error: "Authentication failed",
            });
          }
        });
      } else {
        callback(404, {
          error: "There was an error in your request",
        });
      }
    });
  } else {
    callback(404, {
      error: "There was an error in your request",
    });
  }
};

handler._check.put = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.body.id &&
    requestedProperties.body.id.trim().length === 20
      ? requestedProperties.body.id
      : false;

  const protocol =
    typeof requestedProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestedProperties.body.protocol) > -1
      ? requestedProperties.body.protocol
      : false;

  const url =
    typeof requestedProperties.body.url === "string" &&
    requestedProperties.body.url.trim().length > 0
      ? requestedProperties.body.url
      : false;

  const method =
    typeof requestedProperties.body.method === "string" &&
    ["POST", "GET", "PUT", "DELETE"].indexOf(requestedProperties.body.method) >
      -1
      ? requestedProperties.body.method
      : false;

  const successCodes =
    typeof requestedProperties.body.successCodes === "object" &&
    requestedProperties.body.successCodes instanceof Array
      ? requestedProperties.body.successCodes
      : false;

  const timeOutSeconds =
    typeof requestedProperties.body.timeOutSeconds === "number" &&
    requestedProperties.body.timeOutSeconds % 1 === 0 &&
    requestedProperties.body.timeOutSeconds >= 1 &&
    requestedProperties.body.timeOutSeconds <= 5
      ? requestedProperties.body.timeOutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeOutSeconds) {
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          const checkObject = parseJSON(checkData);

          const token =
            typeof requestedProperties.headers.token === "string"
              ? requestedProperties.headers.token
              : false;

          if (token) {
            tokenHandler._tokens.verify(token, checkObject.phone, (tokenId) => {
              if (tokenId) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeOutSeconds) {
                  checkObject.timeOutSeconds = timeOutSeconds;
                }

                data.update("checks", id, checkObject, (err) => {
                  if (!err) {
                    callback(200, {
                      message: "Checks updated successfully!!",
                    });
                  } else {
                    callback(500, {
                      error: "There was an server side error",
                    });
                  }
                });
              } else {
                callback(500, {
                  error: "Authentication failed",
                });
              }
            });
          } else {
            error: "Authentication failed";
          }
        } else {
          callback(500, {
            error: "There was an error in your request",
          });
        }
      });
    } else {
      callback(400, {
        error: "You have to update at least one field",
      });
    }
  } else {
    callback(500, {
      error: "There was an error in your request",
    });
  }
};

handler._check.delete = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.queryStringObject.id === "string" &&
    requestedProperties.queryStringObject.id.trim().length === 20
      ? requestedProperties.queryStringObject.id
      : false;

  if (id) {
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const checkObject = parseJSON(checkData);
        const token =
          typeof requestedProperties.headers.token === "string"
            ? requestedProperties.headers.token
            : false;
        tokenHandler._tokens.verify(token, checkObject.phone, (tokenId) => {
          if (tokenId) {
            data.read("users", checkObject.phone, (err, userData) => {
              if (!err && userData) {
                const userObject = parseJSON(userData);

                const userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                const checkPosition = userChecks.indexOf(id);

                userChecks.splice(checkPosition, 1);

                userObject.checks = userChecks;

                data.update("users", checkObject.phone, userObject, (err) => {
                  if (!err) {
                    data.delete("checks", id, (err) => {
                      if (!err) {
                        callback(200, {
                          message: "Check deleted successfully",
                        });
                      } else {
                        callback(500, {
                          error: "There was an server side error",
                        });
                      }
                    });
                  } else {
                    callback(500, {
                      error: "There was a server side error",
                    });
                  }
                });
              } else {
                callback(400, {
                  error: "There was a server side error",
                });
              }
            });
          } else {
            callback(403, {
              error: "Authentication failed",
            });
          }
        });
      } else {
        callback(404, {
          error: "There was an error in your request",
        });
      }
    });
  } else {
    callback(404, {
      error: "There was an error in your request",
    });
  }
};

module.exports = handler;
