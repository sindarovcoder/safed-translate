const MAX_MESSAGE_LENGTH = 4096;
const CODE_BLOCK_OVERHEAD = 8; // Account for ``` markers and newlines

/**
 * Sends a long message split into chunks with proper code formatting
 * @param {TelegramBot} bot - Bot instance
 * @param {number|string} chatId - Target chat ID
 * @param {string} message - Message content to send
 * @param {object} [options] - Additional options
 * @param {number} [options.delay=500] - Delay between chunks in ms
 * @returns {Promise<void>}
 */
async function sendLongMessage(bot, chatId, message, options = {}) {

    const { delay = 500 } = options;
    const effectiveMaxLength = MAX_MESSAGE_LENGTH - CODE_BLOCK_OVERHEAD;

    try {
        // Early return for empty messages
        if (!message?.trim()) {
            await bot.sendMessage(chatId, "✉️ Bo'sh xabar");
            return;
        }

        // Process in chunks
        for (let i = 0; i < message.length; i += effectiveMaxLength) {
            const chunk = message.substring(i, i + effectiveMaxLength);
            const formattedMessage = `\`\`\`\n${chunk}\n\`\`\``;

            await bot.sendMessage(chatId, formattedMessage, {
                parse_mode: "Markdown",
                reply_to_message_id: options.reply_to_message_id
            });

            // Add delay between chunks to avoid rate limiting
            if (i + effectiveMaxLength < message.length && delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    } catch (error) {
        console.error('Error sending long message:', error);
        // Fallback to plain text if Markdown fails
        if (error.message.includes('Markdown')) {
            await sendPlainTextChunks(bot, chatId, message, effectiveMaxLength, delay);
        } else {
            throw error;
        }
    }
}

/**
 * Fallback method for sending plain text chunks
 */
async function sendPlainTextChunks(bot, chatId, message, chunkSize, delay) {
    for (let i = 0; i < message.length; i += chunkSize) {
        await bot.sendMessage(chatId, message.substring(i, i + chunkSize));
        if (i + chunkSize < message.length && delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

module.exports = sendLongMessage;