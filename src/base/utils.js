const moment = require("moment");
const { uploadFile } = require("../apis/uploadFile");

function formatTime(time) {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
}

const regexLocation =
  /\{latitude:([-+]?\d*\.\d+|\d+),longitude:([-+]?\d*\.\d+|\d+)\}/;

const formattedNumber = (number) => {
  return number?.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};


function validateTrackingNumbers(trackingNumbers) {

  const regex = /^(?=(.*\d){4})[A-Za-z\d]{8,}$/;

  const numbers = trackingNumbers.split(/[\s,|-]+/);

  return numbers.every(number => regex.test(number.trim()));
}


async function downloadAndConvertToBase64(url, chatId) {

  try {
    const response = await fetch(url);

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    return await uploadFile(chatId, buffer, { contentType: getMimeType(url), filename: 'abusaxiytez.' + url.split('.').pop().toLowerCase() });

  } catch (error) {
    console.error('Faylni yuklab olishda xato:', error.message);
  }
}

function getMimeType(filePath) {

  const extension = filePath.split('.').pop().toLowerCase();

  const mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    pdf: 'application/pdf',
    txt: 'text/plain',
  };
  return mimeTypes[extension] || 'application/octet-stream'; // Agar noma'lum bo'lsa, standart MIME
}


const groupedData = (data) => {
  return data.reduce((acc, item) => {
    if (!item.mergedId) {
      acc.nullMergedId.push(item);
    } else {
      if (!acc.groupedByMergedId[item.mergedId]) {
        acc.groupedByMergedId[item.mergedId] = [];
      }
      acc.groupedByMergedId[item.mergedId].push(item);
    }
    return acc;
  }, { nullMergedId: [], groupedByMergedId: {} });
}


const botCommands = [
  { command: "/start", description: "Boshlash / Hачать / Start / 开始" },
  // { command: "/lang", description: "Til / Язык / Language / 语言" },
  // { command: "/unlawful", description: "Shartlarni va qoidalar!" }
];


const feedbackGroupId = process.env.FEEDBACK_GROUP_ID;

const groupIds = [feedbackGroupId, -1002257410312, -1002428369258, 784562004]


const localesLanguage = ['uz', 'en', 'tr', 'zh', 'ru', 'es', 'fr', 'de', 'it', 'ar'];
const OCR_LANGUAGES = "uzb+eng+rus";


function getLocaleLanguage(locale) {
  return localesLanguage.includes(locale) ? locale : 'uz';
}


const generateRedirectWebAppUrl = (token, redirectPath, options = {}) => {
  const data = JSON.stringify({ token, redirect: redirectPath, isTelegramBot: true, ...options });
  const encodedData = Buffer.from(data, 'utf8').toString("hex");

  const baseUrl = process.env.WEB_PAGE_URL;
  return `${baseUrl}redirect/${encodedData}`;
};


module.exports = {
  formatTime,
  regexLocation,
  formattedNumber,
  validateTrackingNumbers,
  downloadAndConvertToBase64,
  botCommands,
  groupedData,
  feedbackGroupId,
  groupIds,
  getLocaleLanguage,
  localesLanguage,
  generateRedirectWebAppUrl,
  OCR_LANGUAGES
};
