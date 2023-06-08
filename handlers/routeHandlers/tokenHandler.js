const {
  hash,
  parseJSON,
  createRandomString,
} = require("../../helpers/utilities");
const data = require("../../lib/data");
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._tokens[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._tokens = {};

handler._tokens.post = (requestedProperties, callback) => {
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

  if (phone && password) {
    data.read("users", phone, (err, userData) => {
      const user = { ...parseJSON(userData) };

      if (phone === user.phone && hash(password) === user.password) {
        const tokenId = createRandomString(20);
        const expires = Date.now() + 60 * 60 * 1000;

        const tokenObject = {
          phone,
          tokenId,
          expires,
        };

        data.create("tokens", tokenId, tokenObject, (err) => {
          if (!err) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: "There was an server side error",
            });
          }
        });
      } else {
        callback(500, {
          error: "Incorrect phone number or password",
        });
      }
    });
  } else {
    callback(500, {
      error: "There was an error in your request",
    });
  }
};

handler._tokens.get = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.queryStringObject.id === "string" &&
    requestedProperties.queryStringObject.id.trim().length > 0
      ? requestedProperties.queryStringObject.id
      : false;

  if (id) {
    data.read("tokens", id, (err, data) => {
      const token = { ...parseJSON(data) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: "Requested token not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested token not found",
    });
  }
};

handler._tokens.put = (requestedProperties, callback) => {
  const tokenId =
    typeof requestedProperties.body.tokenId === "string" &&
    requestedProperties.body.tokenId.trim().length > 0
      ? requestedProperties.body.tokenId
      : false;

  const extend =
    typeof requestedProperties.body.extend === "boolean" &&
    requestedProperties.body.extend === true
      ? requestedProperties.body.extend
      : false;
  if (tokenId && extend) {
    data.read("tokens", tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        const token = parseJSON(tokenData);
        if (token.expires > Date.now()) {
          token.expires = Date.now() + 60 * 60 * 100;
          callback(200, token);
        } else {
          callback(400, {
            error: "Token already expired",
          });
        }
      } else {
        callback(400, {
          error: "Invalid token id",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was an error in your request",
    });
  }
};

handler._tokens.delete = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.queryStringObject.id === "string" &&
    requestedProperties.queryStringObject.id.trim().length > 0
      ? requestedProperties.queryStringObject.id
      : false;

  if (id) {
    data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200, {
              message: "Token deleted successfuly",
            });
          } else {
            callback(400, {
              error: "There was a server side error",
            });
          }
        });
      } else {
        callback(404, {
          error: "Token not found",
        });
      }
    });
  } else {
    callback(500, {
      error: "There was a error in your request",
    });
  }
};

handler._tokens.verify = (id, phone, callback) => {
  data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handler;
