const { regexLocation } = require("../../base/utils");
const { mainMenuKeyboard, startKeyboard } = require("../../config/keyboards");
const { authHandler } = require("../../apis");
const bot = require("../core/bot");
const { getChatState } = require("../service/chatService");
const i18n = require("../../config/i18n");
const _ = require("lodash");
const TelegramBot = require("node-telegram-bot-api");
const { setLanguagePatch } = require("../../apis/profile");
const { getClientInfo } = require("../../apis/auth");

async function sendConfig(chatId, curOperation, firstChat = null) {
  const configs = [
    "START",
    "CALL_CENTER",
    "ADD_ADDRESS",
    "MY_ORDERS",
    "UN_PAID_ORDERS",
    "SIMPLE_CREATE_ORDER",
    "SEARCH_ORDER",
    "CHINA_ADDRESS",
    "BANK_CARD_OR_CASH",
  ];
  // "OUR_ADDRESS",

  if (configs.includes(curOperation)) {
    try {
      const companyBotConfig = await authHandler.getBotConfig(chatId);
      chatId = chatId ?? firstChat;
      const currentConfig = companyBotConfig.botConfig[curOperation];

      if (!currentConfig) {
        return;
      }

      let caption = currentConfig.text[i18n.getLocale()];


      if (currentConfig?.photo) {
        await bot.sendPhoto(chatId, currentConfig.photo, {
          caption,
          parse_mode: "HTML",
        });
        caption = null;
      }
      if (currentConfig?.video) {
        await bot.sendVideo(chatId, currentConfig?.video, { caption, parse_mode: "HTML" });
        caption = null;
      }

      if (caption) {
        if (curOperation == "OUR_ADDRESS") {
          const match = caption.match(regexLocation);
          await bot.sendMessage(chatId, caption.replace(/{latitude:[^}]+}/, ""), { parse_mode: "HTML" });

          match &&
            (await bot.sendLocation(
              chatId,
              parseFloat(match[1]),
              parseFloat(match[2]),
            ));
        } else {
          await bot.sendMessage(chatId, caption, { parse_mode: "HTML" });
        }
      }

      if (currentConfig["card_number"]) {
        bot.sendMessage(
          chatId,
          currentConfig?.card_number + "\n\n" + currentConfig?.cardholder_name,
        );
      }
    } catch (error) {
      console.error(error.stack);
    }
  }
}

/**
 * set language operation
 * @param {number} chatId
 * @param {TelegramBot.CallbackQuery} query
 */
async function changeLanguage(chatId, query) {

  let chatState = getChatState(chatId);
  chatState.language = query.data;

  i18n.setLocale(query.data);

  if (chatState.operation === "REGISTER") {
    return bot.sendMessage(chatId, i18n.__("steps.language.changeLang"));
  }

  try {
    const client = await getClientInfo(chatId)

    return Promise.all([
      bot.sendMessage(chatId, i18n.__("steps.language.changeLang"), mainMenuKeyboard()),
      setLanguagePatch(chatId, client.id, { language: query.data }),
      bot.deleteMessage(chatId, query.message?.message_id),
    ])

  } catch (error) {
    bot.sendMessage(chatId, i18n.__("steps.language.changeLang"), startKeyboard());
    bot.deleteMessage(chatId, query.message?.message_id);
  }


}

module.exports = {
  sendConfig,
  changeLanguage,
};