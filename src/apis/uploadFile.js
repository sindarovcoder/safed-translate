const { post } = require("./apiClient");

const FormData = require('form-data');

async function uploadFile(chatId, buffer, data) {

  const form = new FormData();
  form.append('file', buffer, data);
  return await post("/aliyun/uploadFile", form, chatId, {
    ...form.getHeaders()
  });
}


module.exports = {
  uploadFile,
};
