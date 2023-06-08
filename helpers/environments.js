const environments = {};

environments.staging = {
  port: 3000,
  message: "staging",
  secretKey: "jkddfdfgfghgfhhgffghghggf",
  maxChecks: 5,
  twilio: {
    fromPhone: "+13613015841",
    accountSID: "AC3a1adc9eb6dba6ee166af02a66d6ed05",
    authToken: "e6f23873e4cd837efa00464188ee7976",
  },
};

environments.production = {
  port: 5000,
  message: "production",
  secretKey: "jkddfdfgfghgfhhgffghghggf",
  maxChecks: 5,
  twilio: {
    fromPhone: "+13613015841",
    accountSID: "AC3a1adc9eb6dba6ee166af02a66d6ed05",
    authToken: "e6f23873e4cd837efa00464188ee7976",
  },
};

const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

const environmentTOExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentTOExport;
