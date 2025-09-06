const { botCommands } = require("../../base/utils");
const { inlineQuery } = require("../handlers/inlineQueryHandler");
const { handleMedia } = require("../handlers/mediaHandler");
const { messageHandler } = require("../handlers/messageHandler");
const { startHandler } = require("../handlers/startHandler");
const { callbackQuery } = require("../handlers/callbackHandler");


const bot = require("./bot");

bot.setMyCommands(botCommands);

bot.on("photo", async (msg) => handleMedia(bot, msg, "photo"));
bot.on("document", async (msg) => { return handleMedia(bot, msg, "document") });
bot.on("voice", async (msg) => handleMedia(bot, msg, "voice"));
bot.on("video_note", async (msg) => handleMedia(bot, msg, "video_note"));
bot.on("video", async (msg) => handleMedia(bot, msg, "video"));
bot.on("message", async (msg) => {
    if (msg.text?.startsWith("/start")) {
        return startHandler(bot, msg);
    } else if (msg.text == '.ocr') {
        return handleMedia(bot, msg, "photo");
    }
    return messageHandler(bot, msg);
});
bot.on("inline_query", async (query) => inlineQuery(bot, query));
bot.on("callback_query", async (query) => callbackQuery(bot, query));
module.exports = bot;
