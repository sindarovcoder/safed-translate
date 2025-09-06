const { get } = require("./apiClient");

async function getAllPvz(chatId) {
  return get("/pvz/pick-up-point", {}, chatId);
}

module.exports = {
  getAllPvz,
};
