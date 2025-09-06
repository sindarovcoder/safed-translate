
require('dotenv').config();
const requiredVariables = [
  "NODE_ENV",
  "TZ",
  "TOKEN",
  "WEB_PAGE_URL",
  "API_URL",
  "API_SECRET",
  "WEBHOOK_URL",
  "PORT",
  "BOT_TYPE",
  "BOT_NAME",
  "START_VIDEO_FILE_ID",
];

function checkEnv(server) {
  const missingVariables = requiredVariables.filter((variable) => {
    const value = process.env[variable];
    return !value || value.trim() === "";
  });
  
  if (missingVariables.length > 0) {

    console.log(`Missing or empty required environment variables: ${missingVariables.join(", ")}`);
    console.log("Server has been stopped.");
    server.close(() => {
      process.exit(1);
    });
  }
}

const config = {
  NODE_ENV: process.env.NODE_ENV,
  TZ: process.env.TZ,
  TOKEN: process.env.TOKEN,
  WEB_PAGE_URL: process.env.WEB_PAGE_URL,
  API_URL: process.env.API_URL,
  API_SECRET: process.env.API_SECRET,
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  PORT: process.env.PORT,
  BOT_TYPE: process.env.BOT_TYPE,
  BOT_NAME: process.env.BOT_NAME,
  START_VIDEO_FILE_ID: process.env.START_VIDEO_FILE_ID,
}

module.exports = { config, checkEnv };
