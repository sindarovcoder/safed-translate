module.exports = {
  handleRegister,
  handleLogin,
};

const bot = require("../core/bot");
const { mainMenuKeyboard, startKeyboard } = require("../../config/keyboards");
const { authHandler } = require("../../apis");
const { setChatNext } = require("../service/chatService");
const { sendChinaAddress } = require("./addressOperation");
const { handleOperationStart } = require("./operationManager");
const i18n = require("../../config/i18n");

async function handleRegister(chatId, data) {
  try {
    const msg = await authHandler.register(chatId, data);
    await bot.sendMessage(chatId, msg, mainMenuKeyboard());
  } catch (error) {
    await bot.sendMessage(
      chatId,
      `${i18n.__("registration_failed")}${error.message}`,
      startKeyboard(),
    );
  }
  await sendChinaAddress(chatId);
  setChatNext(chatId, true);
}

async function handleLogin(chatId, data) {
  try {
    await authHandler.login(chatId, data);
    bot.sendMessage(
      chatId,
      i18n.__("login_successful"),
      mainMenuKeyboard(),
    );
  } catch (error) {
    await bot.sendMessage(chatId, i18n.__("login_failed"));
    await handleOperationStart(chatId, "LOGIN", { text: "LOGIN" });
    setChatNext(chatId, true);
  }
}
