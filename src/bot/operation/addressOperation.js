module.exports = {
  sendChinaAddress,
  switchAddAddress,
  switchOurAddress,
  switchAddOurAddressMap,
  handleAddAddress,
  handleOurAddress,
};

const bot = require("../core/bot");
const {
  addressHandler,
  authHandler,
  profileHandler,
} = require("../../apis");
const { getRegions } = require("../../steps");
const {
  chatStates,
  switchOperation,
  setChatNext,
} = require("../service/chatService");
const { handleStepOperationReply } = require("./operationManager");
const { mainMenuKeyboard, webAppKeyboard } = require("../../config/keyboards");
const i18n = require("../../config/i18n");

async function sendChinaAddress(chatId) {
  const chinaAddress = await addressHandler.getChinaAddress(chatId);
  await bot.sendMessage(chatId, chinaAddress.address, { parse_mode: "HTML" });
  return bot.sendMessage(chatId, chinaAddress.postalCode, {
    parse_mode: "HTML",
  });
}

async function switchAddAddress(chatId) {
  const oldChatState = chatStates[chatId];
  const phone = oldChatState.data.REGISTER.data.phoneNumber;
  const name = oldChatState.data.REGISTER.data.name;

  switchOperation(chatId, "ADD_ADDRESS");
  const addressData = chatStates[chatId].data.ADD_ADDRESS.data;
  addressData.phone = phone;
  addressData.name = name;

  chatStates[chatId].data.ADD_ADDRESS.options = await getRegions(chatId);
  await handleStepOperationReply(chatId, "ADD_ADDRESS", 0);
}

async function switchOurAddress(chatId) {
  const oldChatState = chatStates[chatId];

  switchOperation(chatId, "OUR_ADDRESS");

  chatStates[chatId].SIMPLE_CREATE_ORDER = "SIMPLE_CREATE_ORDER";

  if (process.env.BOT_TYPE == "P2C") {
    //
    return await switchAddOurAddressMap(
      chatId,
      oldChatState.data.SIMPLE_CREATE_ORDER.message_id + 1,
    );
  }

  chatStates[chatId].data.OUR_ADDRESS.options = await getPvzAddress(chatId);

  await handleStepOperationReply(chatId, "OUR_ADDRESS", 0);
}

async function switchAddOurAddressMap(
  chatId,
  messageId,
  buttonText = "add",
  messageText = i18n.__("steps.createOrder.selectPvz"),
) {
  const { token } = await authHandler.generateToken(chatId);

  const message = btoa(JSON.stringify({ chatId, messageId }));

  const keyboard = webAppKeyboard(i18n.__(buttonText), token, `/serviceMap?message=${message}`);

  return bot.sendMessage(chatId, messageText, keyboard);
}

async function handleAddAddress(chatId, data) {
  try {
    const msg = await addressHandler.addAddress(chatId, data);
    await bot.sendMessage(chatId, msg, mainMenuKeyboard());
  } catch (error) {
    await bot.sendMessage(
      chatId,
      i18n.__("address_add_failed"),
      mainMenuKeyboard(),
    );
  }
}

async function handleOurAddress(chatId, data) {
  const oldMsg = chatStates[chatId].data.OUR_ADDRESS.oldMessageId;

  const oldChatState = chatStates[chatId];

  try {
    const msg = await profileHandler.addClientPvz(chatId, data);
    await bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: oldMsg,
      ...mainMenuKeyboard(),
    });
  } catch (error) {
    await bot.deleteMessage(chatId, oldMsg);
    await bot.sendMessage(
      chatId,
      i18n.__("address_add_failed"),
      mainMenuKeyboard(),
    );
  }

  if (oldChatState?.SIMPLE_CREATE_ORDER) {
    switchOperation(chatId, oldChatState?.SIMPLE_CREATE_ORDER);
    await handleStepOperationReply(
      chatId,
      oldChatState?.SIMPLE_CREATE_ORDER,
      0,
    );
    setChatNext(chatId, true);
  }
}
