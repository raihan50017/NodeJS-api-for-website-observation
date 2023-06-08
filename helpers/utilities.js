const crypto = require("crypto");
const environments = require("../helpers/environments");
const utilities = {};

utilities.parseJSON = (jsonString) => {
  let output;

  try {
    output = JSON.parse(jsonString);
  } catch (err) {
    console.log(err.message);
    output = {};
  }

  return output;
};

utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", environments.secretKey)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

utilities.createRandomString = (strLength) => {
  const length =
    typeof strLength === "number" && strLength > 0 ? strLength : false;

  if (strLength) {
    const possibleCharacter = "abcdefghijklmnopqrstuvwxyz0123456789";
    let output = "";

    for (let i = 1; i <= length; i++) {
      output += possibleCharacter.charAt(
        Math.floor(Math.random() * possibleCharacter.length)
      );
    }
    return output;
  } else {
    return false;
  }
};

module.exports = utilities;
