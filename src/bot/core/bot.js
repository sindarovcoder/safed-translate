const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.TOKEN;
const NODE_ENV = process.env.NODE_ENV;

const bot = new TelegramBot(TOKEN, { polling: !!NODE_ENV });

module.exports = bot;
