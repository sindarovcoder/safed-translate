const { get, post } = require("./apiClient");
const i18n = require("../config/i18n");
const { formatTime } = require("../base/utils");

async function addAddress(chatId, data) {
  data.isDefault = true;

  if (data.additionalInfo === '/skip') data.additionalInfo = '';

  const address = await post("/address", data, chatId);

  return (
    i18n.__("address.createdSuccess") +
    "\n" +
    i18n.__("address.name") +
    address.name +
    "\n" +
    i18n.__("address.phone") +
    address.phone +
    "\n" +
    i18n.__("address.address") +
    address.fullAddress +
    "\n" +
    i18n.__("address.createdAt") +
    formatTime(address.createdAt) +
    "\n"
  );
}

async function getChinaAddress(chatId) {
  return get("/client/chinaAddress", {}, chatId);
}

async function getDefaultAddress(chatId) {
  const data = await get("/address", { s: { isDefault: true } }, chatId);
  if (!data.length) return i18n.__("address.notFound");

  const address = data[0];
  return (
    '<blockquote>' + i18n.__("address.defaultAddress") +
    ":\n" +
    i18n.__("address.name") +
    address.name +
    "\n" +
    i18n.__("address.phone") +
    address.phone +
    "\n" +
    i18n.__("address.address") +
    address.fullAddress +
    "\n" +
    i18n.__("address.createdAt") +
    formatTime(address.createdAt) +
    "\n" + '</blockquote>'
  );
}

async function getAllRegions(chatId) {
  return get("/region", {}, chatId);
}

module.exports = {
  addAddress,
  getDefaultAddress,
  getAllRegions,
  getChinaAddress,
};
