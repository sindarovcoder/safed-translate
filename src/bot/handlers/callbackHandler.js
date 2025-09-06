const { localesLanguage } = require("../../base/utils");
const { getChatState, getStep, getKeyByValue } = require("../service/chatService");
const { checkSubscriptionStatus } = require("../../apis/auth");

const { keyboards } = require("../../config/keyboards");

const { changeLanguage, handleProcess, sendConfig, handleOperationStart } = require("../operation");

async function callbackQuery(bot, query) {
    const chatId = query.message.chat.id;
    const callbackData = query.data;


    try {

        const curOperation = getKeyByValue(keyboards(), callbackData);

        if (curOperation) {
            await Promise.all([
                sendConfig(chatId, curOperation),
                handleOperationStart(chatId, curOperation, query)
            ])
        } else {
            const chatState = getChatState(chatId);
            const operation = chatState.operation;

            if (operation && getStep(chatId) > -1) {
                await handleProcess(chatId, operation, callbackData);
            }

            bot.deleteMessage(chatId, query.message.message_id)
        }


    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "Xatolik yuz berdi!");
    }

    bot.answerCallbackQuery(query.id);
}

module.exports = { callbackQuery };
