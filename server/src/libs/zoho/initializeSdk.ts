const Levels = require('zoi-nodejs-sdk/routes/logger/logger').Levels;
const Constants = require('zoi-nodejs-sdk/utils/util/constants').Constants;
const APIKey = require('zoi-nodejs-sdk/models/authenticator/apikey').APIKey;
const Environment = require('zoi-nodejs-sdk/routes/dc/environment').Environment;
const LogBuilder =
  require('zoi-nodejs-sdk/routes/logger/log_builder').LogBuilder;
const UserSignature =
  require('zoi-nodejs-sdk/routes/user_signature').UserSignature;
const InitializeBuilder =
  require('zoi-nodejs-sdk/routes/initialize_builder').InitializeBuilder;

let user: any, environment: any, apikey: any, logger: any, initialize: any;

// Include zoi-nodejs-sdk package in your package json and the execute this
// code.

export async function initializeSdk() {
  user = new UserSignature(process.env.USER_SIGNATURE);

  environment = new Environment(process.env.ENV_BASE_URL, null, null);

  apikey = new APIKey(process.env.API_KEY, Constants.PARAMS);

  logger = new LogBuilder().level(Levels.INFO).filePath('./app.log').build();

  initialize = await new InitializeBuilder();

  await initialize
    .user(user)
    .environment(environment)
    .token(apikey)
    .logger(logger)
    .initialize();

  console.log('\nSDK initialized successfully.');
}

export const getInitData = () => ({
  user,
  environment,
  apikey,
  logger,
  initialize,
});
