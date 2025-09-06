require("dotenv").config();
const bot = require("./core/events")

bot.on("polling_error", (err) => console.error("Polling error:", err));

console.log("🤖 Bot ishga tushdi...");

module.exports = bot;
