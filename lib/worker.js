//dependencies
const url = require("url");
const http = require("http");
const https = require("https");
const { parseJSON } = require("../helpers/utilities");
const data = require("./data");
const { sendTwilioSms } = require("../helpers/notifications");

//worker object module scafolding

const worker = {};

worker.loop = () => {
  setInterval(() => {
    worker.gatherAllCheck();
  }, 1000 * 20);
};

worker.validateIndividualCheckData = (checkData) => {
  if (checkData && checkData.id) {
    let checkObject = checkData;

    checkObject.state =
      typeof checkObject.state === "string" &&
      ["up", "down"].indexOf(checkObject.state) > -1
        ? checkObject.state
        : "down";

    checkObject.lastChecked =
      typeof checkObject.lastChecked === "number" && checkObject.lastChecked > 0
        ? checkObject.lastChecked
        : false;

    worker.performCheck(checkObject);
  } else {
    console.log("Error: check was invalid or not properly formatted");
  }
};

worker.performCheck = (checkObject) => {
  let checkOutcome = {
    error: false,
    responseCode: false,
  };

  let outcomeSent = false;

  const parsedUrl = url.parse(
    checkObject.protocol + "://" + checkObject.url,
    true
  );
  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path;

  const requestDetails = {
    hostname,
    method: checkObject.method.toUpperCase(),
    path,
    timeout: checkObject.timeOutSeconds * 1000,
  };

  const protocolToUse = checkObject.protocol === "http" ? http : https;

  const req = protocolToUse.request(requestDetails, (res) => {
    const status = res.statusCode;
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      worker.processCheckOutcome(checkObject, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("error", (err) => {
    checkOutcome = {
      error: true,
      valur: err,
    };

    if (!outcomeSent) {
      worker.processCheckOutcome(checkObject, checkOutcome);
    }
  });

  req.on("timeout", (err) => {
    checkOutcome = {
      error: true,
      value: "Timeout",
    };
    if (!outcomeSent) {
      worker.processCheckOutcome(checkObject, checkOutcome);
    }
  });

  req.end();
};

worker.processCheckOutcome = (checkObject, checkOutcome) => {
  let state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    checkObject.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  let alertWanted = checkObject.lastChecked && checkObject.state !== state;

  let newCheckData = checkObject;

  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        worker.alertUserToStateChange(newCheckData);
      } else {
        console.log("No need to sent alert as state not changed");
      }
    } else {
      console.log("Error trying to save check data of one of the checks");
    }
  });
};

worker.alertUserToStateChange = (newCheckData) => {
  let msg = `Alert your change for ${newCheckData.method.toLowerCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currently ${newCheckData.state}`;

  sendTwilioSms(newCheckData.phone, msg, (err) => {
    if (!err) {
      console.log(`User was alerted to change state via sms ${msg}`);
    } else {
      console.log("There was a problem sending sms to one user");
    }
  });
};

worker.gatherAllCheck = () => {
  data.list("checks", (err, checks) => {
    if (!err && checks.length > 0) {
      checks.forEach((check) => {
        data.read("checks", check, (err, checkData) => {
          if (!err && checkData) {
            worker.validateIndividualCheckData(parseJSON(checkData));
          } else {
            console.log("Error found in one of reading check data");
          }
        });
      });
    } else {
      console.log("Error: could not find any check");
    }
  });
};

worker.init = () => {
  worker.gatherAllCheck();

  worker.loop();

  console.log("Worker statted");
};

module.exports = worker;
