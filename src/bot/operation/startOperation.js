

const bot = require("../core/bot");
const { mainMenuKeyboard, startKeyboard } = require("../../config/keyboards");
const { authHandler } = require("../../apis");
const { resetChatState } = require("../service/chatService");
const { sendConfig } = require("./botConfigOperation");
const i18n = require("../../config/i18n");

async function start(chatId, msg) {
  const welcomeKey =
    process.env.BOT_TYPE === "P2C" ? "welcome_p2c" : "welcome_b2c";

  try {

    const client = await authHandler.getClientByChatId(chatId);

    console.log('====================================');
    console.log(client);
    console.log('====================================');

    if (client) {

      const welcomeLoggedKey =
        process.env.BOT_TYPE === "P2C"
          ? "welcome_logged_p2c"
          : "welcome_logged_b2c";

      await bot.sendMessage(
        chatId,
        i18n.__(welcomeLoggedKey, {
          name: client.name || client.phoneNumber,
          botName: process.env.BOT_NAME,
        }),
        mainMenuKeyboard(),
      );

      // await sendConfig(chatId, "START");
    } else {
      await bot.sendMessage(
        chatId,
        i18n.__(welcomeKey, { botName: process.env.BOT_NAME }),
        startKeyboard(),
      );

      await authHandler.register(chatId, {
        name: msg.from.first_name + " " + msg.from.last_name,
        username: msg.from.username,
        phone: msg.from.phone_number,
        avatar: msg.from.photo
      });
    }
  } catch (error) {
    // await sendConfig(null, "START", chatId);
    await bot.sendMessage(
      chatId,
      i18n.__(welcomeKey, { botName: process.env.BOT_NAME }),
      startKeyboard(),
    );
  }
}

async function resetChat(chatId, msg) {
  resetChatState(chatId);
  return await start(chatId, msg);
}

module.exports = { start, resetChat };
