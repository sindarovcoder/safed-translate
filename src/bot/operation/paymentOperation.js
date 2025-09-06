const bot = require("../core/bot");
const { profileHandler } = require("../../apis");
const { mainMenuKeyboard } = require("../../config/keyboards");

async function handleBankORCash(chatId, data) {
  try {
    const response = await profileHandler.cashPay(chatId, data?.CashPay);
    await bot.sendMessage(chatId, response, mainMenuKeyboard());
  } catch (error) {
    await bot.sendMessage(chatId, error.message, mainMenuKeyboard());
  }
}

module.exports = {
  handleBankORCash,
};
