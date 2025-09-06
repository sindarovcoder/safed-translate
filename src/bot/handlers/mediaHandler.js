const TelegramBot = require("node-telegram-bot-api");
const path = require("path");
const downloadTelegramFile = require("../helpers/downloadTelegramFile");
const extractTextFromImg = require("../helpers/extractTextFromImg");
const extractTextFromPdf = require("../helpers/extractTextFromPdf");
const extractTextFromDocx = require("../helpers/extractTextFromDocx");
const extractTextFromXlsx = require("../helpers/extractTextFromXlsx");
const sendLongMessage = require("../helpers/sendLongMessage");

const translateText = require("../helpers/translateText")
const SUPPORTED_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg']);
const SUPPORTED_DOCX_EXTS = new Set(['.docx', '.doc']);
const SUPPORTED_XLSX_EXTS = new Set(['.xlsx', '.xls']);
const DEFAULT_ERROR_MSG = '❌ Tarjima qilib bo‘lmadi.';

const { extractLanguages } = require("../../base/languages")



/**
 * Handles media files sent to the bot
 * @param {TelegramBot} bot - Bot instance
 * @param {TelegramBot.Message} msg - Message object
 * @param {'photo' | 'document' | 'voice' | 'video_note' | 'video'} type - Media type
 * @returns {Promise<void>}
 */
async function handleMedia(bot, msg, type) {

  const chatId = msg.chat.id;
  const reply_to_message_id = msg.message_id;
  let deleteMessageId = null;


  bot.sendChatAction(chatId, 'typing');
  await bot.sendMessage(chatId, '⚙️ Matn olinmoqda...', {
    parse_mode: "Markdown",
    reply_to_message_id
  }).then((sentMessage) => {
    deleteMessageId = sentMessage.message_id;
  });

  try {
    // Validate and get file data
    const fileData = getFileData(msg, type);

    if (!fileData?.file_id) {
      throw new Error('Invalid file data received');
    }

    // Download file
    const { localFilePath, fileName } = await downloadTelegramFile(bot, fileData);

    // Process file based on type
    let text = await processMediaFile(localFilePath, {
      mimeType: fileData.mime_type,
      fileExt: path.extname(fileName).toLowerCase(),
      caption: msg?.caption
    });

    const languageCode = extractLanguages(msg?.caption);
    if (languageCode) {
      text = await translateText(text, languageCode)
    }

    await sendLongMessage(bot, chatId, text || DEFAULT_ERROR_MSG, { reply_to_message_id });
    await bot.deleteMessage(chatId, deleteMessageId);

  } catch (error) {
    console.error('Media handling error:', error);
    await bot.sendMessage(chatId, `${DEFAULT_ERROR_MSG}\n\nXatolik: ${error.message}`);
  }

  return
}


/**
 * Processes media file based on its type
 * @param {string} filePath - Local file path
 * @param {object} fileInfo - File information
 * @param {string} fileInfo.mimeType - MIME type
 * @param {string} fileInfo.fileExt - File extension
 * @returns {Promise<string>} Extracted text
 */
async function processMediaFile(filePath, { mimeType, fileExt }) {
  try {
    if (mimeType?.includes('pdf')) {
      return await extractTextFromPdf(filePath);
    }

    if (SUPPORTED_IMAGE_EXTS.has(fileExt)) {
      return await extractTextFromImg(filePath);
    }

    if (SUPPORTED_DOCX_EXTS.has(fileExt)) {
      return await extractTextFromDocx(filePath);
    }

    if (SUPPORTED_XLSX_EXTS.has(fileExt)) {
      return await extractTextFromXlsx(filePath);
    }

    throw new Error(`Qo'llab-quvvatlanmaydigan fayl formati: ${mimeType} (${fileExt})`);
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(`Fayl qayta ishlashda xatolik: ${error.message}`);
  }
}

/**
 * Extracts file data from message object
 * @param {TelegramBot.Message} msg - Message object
 * @param {string} type - Media type
 * @returns {object|null} File data
 */
function getFileData(msg, type) {
  if (!msg || typeof msg !== 'object') return null;
  return type === 'photo' ? msg?.photo?.at(-1) ?? msg?.reply_to_message?.photo?.at(-1) : msg?.[type];
}

module.exports = { handleMedia };
