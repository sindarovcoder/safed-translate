module.exports = {
  handleGetOrder,
  handleGetUnPaidOrder,
  handleCreateOrder,
};

const bot = require("../core/bot");
const { mainMenuKeyboard } = require("../../config/keyboards");
const { orderHandler } = require("../../apis");
const { chatStates } = require("../service/chatService");
const i18n = require("../../config/i18n");

async function handleGetOrder(chatId, trackingNumber) {
  try {
    const response = await orderHandler.getOrder(chatId, trackingNumber);
    await bot.sendMessage(chatId, response, mainMenuKeyboard());
  } catch (error) {
    await bot.sendMessage(
      chatId,
      i18n.__("waybill_not_found"),
      mainMenuKeyboard(),
    );
  }
}

async function handleGetUnPaidOrder(chatId) {
  try {
    const data = await orderHandler.getUnPaidOrders(chatId);
    chatStates[chatId] = { ...chatStates[chatId], data };
  } catch (error) {
    await bot.sendMessage(
      chatId,
      i18n.__("failed_operation"),
      mainMenuKeyboard(),
    );
  }
}

async function handleCreateOrder(chatId, trackingNumber) {
  try {
    trackingNumber.trackingNumber = [...new Set(trackingNumber?.trackingNumber.split(/[\s,|-]+/))].join(' ');
    const response = await orderHandler.createOrder(chatId, trackingNumber);
    await bot.sendMessage(chatId, response, mainMenuKeyboard());
  } catch (error) {
    await bot.sendMessage(chatId, error.message, mainMenuKeyboard());
  }
}


