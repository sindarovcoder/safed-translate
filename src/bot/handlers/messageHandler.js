const i18n = require("../../config/i18n");
const TelegramBot = require("node-telegram-bot-api");
const { operationSteps } = require("../../steps");
const { keyboards, languageKeyboard } = require("../../config/keyboards");

const { HttpsProxyAgent } = require("https-proxy-agent");
const { translate } = require("../../translate");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const {
  getLocaleLanguage,
  groupIds,
  feedbackGroupId,
  userMessageMap,
} = require("../../base/utils");
const {
  resetChat,
  sendConfig,
  handleOperationStart,
  handleProcess,
} = require("../operation");
const {
  getKeyByValue,
  getChatState,
  getStep,
} = require("../service/chatService");

const { checkSubscriptionStatus, getClientInfo } = require("../../apis/auth");

/**
 * message handler function
 * @param {TelegramBot} bot
 * @param {TelegramBot.Message} msg
 * @returns
 */



async function messageHandler(bot, msg) {
  const chatId = msg.chat.id;
  let message = msg.text;
  const chatState = getChatState(chatId);

  if (!message) return;


  if (message === "/start") {
    return resetChat(chatId, msg);
  }

  const { text } = await translate(message, {
    to: 'uz',
    from: 'en'
  });

  return bot.sendMessage(chatId, text);

  const language = getLocaleLanguage(msg.from.language_code); // Get the user's language code


  if (!chatState?.language) {
    try {
      const client = await getClientInfo(chatId);

      chatState.language = client.language;
    } catch (error) {
      chatState.language = language;
    }
  } else {
    chatState.language = chatState?.language || language;
  }

  i18n.setLocale(chatState?.language);

  // change language
  if (text === "/lang") {
    await bot.sendMessage(
      chatId,
      i18n.__("steps.language.choiceLang"),
      languageKeyboard()
    );
    return;
  }

  if (chatId == feedbackGroupId && msg.reply_to_message) {
    const originalMessageId = msg.reply_to_message.message_id;
    const { chatId, replyMessageId } = userMessageMap.get(originalMessageId);

    if (chatId) {
      const replyText = msg.text || "Matnsiz xabar";
      const fromGroupUser = msg.from.first_name || "Guruh a'zosi";

      if (msg.photo) {
        const photo = msg.photo[msg.photo.length - 1];
        bot.sendPhoto(chatId, photo.file_id, { caption: replyText });
      }

      if (msg.document) {
        const document = msg.document;
        bot.sendDocument(chatId, document.file_id, { caption: replyText });
      }

      if (msg.voice) {
        const voice = msg.voice;
        bot.sendVoice(chatId, voice.file_id, { caption: replyText });
      }

      if (msg.video_note) {
        const videoNote = msg.video_note;
        bot.sendVideoNote(chatId, videoNote.file_id, { caption: replyText });
      }

      if (msg.location) {
        const location = msg.location;
        bot.sendLocation(chatId, location.latitude, location.longitude);
      }

      if (msg.text) {
        bot.sendMessage(chatId, `${replyText}\n\nKimdan: ${fromGroupUser}`, {
          reply_to_message_id: replyMessageId, // Reply qilinadigan xabar IDsi
        });
      }
    }
    return;
  } else if (!groupIds.includes(chatId)) {
    const status = await checkSubscriptionStatus(chatId, bot)
    if (!status) return
  }

  try {
    const curOperation = getKeyByValue(keyboards(), text);
    if (curOperation) {
      await sendConfig(chatId, curOperation);
      await handleOperationStart(chatId, curOperation, msg);
    } else {
      const chatState = getChatState(chatId);
      const operation = chatState.operation;
      if (operationSteps[operation] && getStep(chatId) > -1) {
        await handleProcess(chatId, operation, text);
        return;
      }
      resetChat(chatId);
    }
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    bot.sendMessage(chatId, i18n.__("failed_operation"));
  }
}

module.exports = { messageHandler };
