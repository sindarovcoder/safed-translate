const { post, get } = require("./apiClient");

async function register(chatId, data) {
  return response = await post("clients", { ...data, chatId });
}

async function getClientByChatId(chatId) {
  const clientData = await get("clients", { chatId: `eq.${chatId}` }, chatId);
  return clientData[0];
}


module.exports = {
  register,
  getClientByChatId
};
