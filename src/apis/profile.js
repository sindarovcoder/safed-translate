const { get, post, patch } = require("./apiClient");
const i18n = require("../config/i18n");
const { formatTime } = require("../base/utils");

async function getProfile(chatId, json = false) {
  const client = await get("/client/info", {}, chatId);

  if (json) return client;

  return buildProfileMsg(client);
}

async function commentPost(chatId, data, headers = {}) {
  await post("/feedback", data, chatId, headers);
  return i18n.__("comment.finishComment");
}

async function commentPostUpload(chatId, data, headers = {}) {
  await post("/feedback/upload", data, chatId, headers);
  return i18n.__("comment.finishComment");
}

async function addClientPvz(chatId, data) {
  const user = await post("/client/addPvz", data, chatId);

  return i18n.__("pvz_address", {
    address: user?.pvz?.fullAddress,
  });
}

async function cashPay(chatId, data) {
  if (!data) return
  const response = await post("/pay/cash", data, chatId);
  return i18n.__("cashPay.finishPay", { paymentNumber: response?.id });
}

async function setLanguagePatch(chatId, clientId, data) {
  await patch(`/client/${clientId}`, data, chatId, {});
}

function buildProfileMsg(client) {

  return (
    // `${i18n.__("profile.profile")}\n` +
    '<blockquote>' + `${i18n.__("profile.code", { code: client.code })}\n` +
    `${i18n.__("profile.name", { name: client.name })}\n` +
    `${i18n.__("profile.phoneNumber", { phoneNumber: client.phoneNumber })}\n` +
    // `${i18n.__("profile.passport", { passportNo: client.passportNo })}\n` +
    `${i18n.__("profile.registerAt", {
      createdAt: formatTime(client.createdAt),
    })}\n` + '</blockquote>'

  );
}

module.exports = {
  getProfile,
  commentPost,
  cashPay,
  addClientPvz,
  buildProfileMsg,
  setLanguagePatch,
  commentPostUpload,
};
