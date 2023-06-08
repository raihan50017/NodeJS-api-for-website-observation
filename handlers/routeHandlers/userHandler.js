const { hash, parseJSON } = require("../../helpers/utilities");
const data = require("../../lib/data");
const tokenHandler = require("../../handlers/routeHandlers/tokenHandler");
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._users = {};

handler._users.post = (requestedProperties, callback) => {
  //console.log(requestedProperties);
  const firstName =
    typeof requestedProperties.body.firstName === "string" &&
    requestedProperties.body.firstName.trim().length > 0
      ? requestedProperties.body.firstName
      : false;

  const lastName =
    typeof requestedProperties.body.lastName === "string" &&
    requestedProperties.body.lastName.trim().length > 0
      ? requestedProperties.body.lastName
      : false;

  const phone =
    typeof requestedProperties.body.phone === "string" &&
    requestedProperties.body.phone.trim().length === 11
      ? requestedProperties.body.phone
      : false;

  const password =
    typeof requestedProperties.body.password === "string" &&
    requestedProperties.body.password.trim().length > 0
      ? requestedProperties.body.password
      : false;

  const tosAgreement =
    typeof requestedProperties.body.tosAgreement === "boolean"
      ? requestedProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    data.read("users", phone, (err, user) => {
      if (err) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        data.create("users", phone, userObject, (err) => {
          if (!err) {
            callback(200, {
              message: "User was created successfully",
            });
          } else {
            callback(500, {
              error: "Could not create user",
            });
          }
        });
      } else {
        callback(500, {
          error: "There was an server sie error",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a error in request",
    });
  }
};

handler._users.get = (requestedProperties, callback) => {
  const phone =
    typeof requestedProperties.queryStringObject.phone === "string" &&
    requestedProperties.queryStringObject.phone.trim().length > 0
      ? requestedProperties.queryStringObject.phone
      : false;

  if (phone) {
    const token =
      typeof requestedProperties.headers.token === "string"
        ? requestedProperties.headers.token
        : false;

    tokenHandler._tokens.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read("users", phone, (err, data) => {
          const user = { ...parseJSON(data) };
          delete user.password;
          if (!err && user) {
            callback(200, user);
          } else {
            callback(404, {
              error: "Requested user not found",
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
      error: "Requested user not found",
    });
  }
};

handler._users.put = (requestedProperties, callback) => {
  const firstName =
    typeof requestedProperties.body.firstName === "string" &&
    requestedProperties.body.firstName.trim().length > 0
      ? requestedProperties.body.firstName
      : false;

  const lastName =
    typeof requestedProperties.body.lastName === "string" &&
    requestedProperties.body.lastName.trim().length > 0
      ? requestedProperties.body.lastName
      : false;

  const phone =
    typeof requestedProperties.body.phone === "string" &&
    requestedProperties.body.phone.trim().length === 11
      ? requestedProperties.body.phone
      : false;

  const password =
    typeof requestedProperties.body.password === "string" &&
    requestedProperties.body.password.trim().length > 0
      ? requestedProperties.body.password
      : false;

  if (phone) {
    const token =
      typeof requestedProperties.headers.token === "string"
        ? requestedProperties.headers.token
        : false;

    tokenHandler._tokens.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read("users", phone, (err, user) => {
          if (!err) {
            const userData = { ...parseJSON(user) };
            if (firstName || lastName || password) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }
              data.update("users", phone, userData, (err) => {
                if (!err) {
                  callback(200, {
                    message: "Data updated successfully!!",
                  });
                } else {
                  callback(400, {
                    error: "errror updating data",
                  });
                }
              });
            } else {
              callback(500, {
                error: "Threre was a error in your request",
              });
            }
          } else {
            callback(404, {
              error: "User not found",
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
    callback(500, {
      error: "Threre was a error in your request",
    });
  }
};

handler._users.delete = (requestedProperties, callback) => {
  const phone =
    typeof requestedProperties.queryStringObject.phone === "string" &&
    requestedProperties.queryStringObject.phone.trim().length > 0
      ? requestedProperties.queryStringObject.phone
      : false;

  if (phone) {
    if (phone) {
      const token =
        typeof requestedProperties.headers.token === "string"
          ? requestedProperties.headers.token
          : false;

      tokenHandler._tokens.verify(token, phone, (tokenId) => {
        if (tokenId) {
          data.read("users", phone, (err, user) => {
            if (!err && user) {
              data.delete("users", phone, (err) => {
                if (!err) {
                  callback(200, {
                    message: "User deleted successfuly",
                  });
                } else {
                  callback(400, {
                    error: "There was a server side error",
                  });
                }
              });
            } else {
              callback(404, {
                error: "User not found",
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
        error: "Requested user not found",
      });
    }
  } else {
    callback(500, {
      error: "There was a error in your request",
    });
  }
};

module.exports = handler;
