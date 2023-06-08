const https = require("https");
const queryString = require("querystring");
const environments = require("../helpers/environments");
const notifications = {};

notifications.sendTwilioSms = (phone, msg, callback) => {
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === "string" && msg.trim().length <= 1600 ? msg.trim() : false;

  if (userPhone && userMsg) {
    const payload = {
      From: environments.twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: `${userMsg}`,
    };

    const stringifyPayload = queryString.stringify(payload);

    const requestDetailsObject = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${environments.twilio.accountSID}/Messages.json`,
      auth: `${environments.twilio.accountSID}: ${environments.twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const req = https.request(requestDetailsObject, (res) => {
      const status = res.statusCode;
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code return was ${status}`);
      }
    });

    req.on("error", (err) => {
      callback(err);
    });

    req.write(stringifyPayload);
    req.end();
  } else {
    callback("Given wrong parameter");
  }
};

module.exports = notifications;
