const { mainMenuKeyboard, startKeyboard } = require("../../config/keyboards");
const { authHandler } = require("../../apis");
const { resetChatState } = require("../service/chatService");
const { sendConfig } = require("../operation/botConfigOperation");
const i18n = require("../../config/i18n");

async function startHandler(bot, msg) {

    const chatId = msg.chat.id;
    const reply_to_message_id = msg.message_id;
    const name = msg.from.first_name + " " + msg.from.last_name;

    try {

        const client = await authHandler.getClientByChatId(chatId);

        if (!client) {
            await authHandler.register(chatId, {
                name: msg.from.first_name + " " + msg.from.last_name,
                username: msg.from.username,
                phone: msg.from.phone_number,
                avatar: msg.from.photo
            });
        }

        await bot.sendMessage(chatId, i18n.__('welcome', { name, join_link: process.env.JOIN_LINK }),
            mainMenuKeyboard({ reply_to_message_id }),
        );

    } catch (error) {
        await bot.sendMessage(
            chatId,
            i18n.__('start_failed_operation', { name }),
            {
                parse_mode: "HTML",
                reply_to_message_id,
            }
        );
    }
}

async function resetChat(chatId, msg) {
    resetChatState(chatId);
    return await startHandler(chatId, msg);
}

module.exports = { startHandler, resetChat };
