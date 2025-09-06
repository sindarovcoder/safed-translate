const OSS = require('ali-oss');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
// const bot = require('./botService');
const bot = require("../core/bot");

// 配置阿里云OSS
const ossConfig = {
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
};

// 创建OSS客户端
const ossClient = new OSS(ossConfig);

// 文件下载函数
async function downloadFile(fileLink, localFilePath) {
    const response = await axios({
        url: fileLink,
        method: 'GET',
        responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(localFilePath);
        response.data.pipe(writer);

        writer.on('finish', () => resolve());
        writer.on('error', (err) => reject(err));
    });
}

// 文件上传函数
async function uploadFileToOSS(localFilePath, fileName) {
    try {
        const result = await ossClient.put(fileName, localFilePath);
        fs.unlinkSync(localFilePath); // 上传后删除本地文件
        return result.url;
    } catch (err) {
        throw new Error('Upload Error: ' + err.message);
    }
}

// 处理文档消息
bot.on('document', async (msg) => {
    await handleFileUpload(msg, 'document');
});

// 处理照片消息
bot.on('photo', async (msg) => {
    await handleFileUpload(msg, 'photo');
});

// 处理文件上传
async function handleFileUpload(msg, type) {
    const chatId = msg.chat.id;
    let fileId, fileName;

    if (type === 'document') {
        fileId = msg.document.file_id;
        fileName = msg.document.file_name;
    } else if (type === 'photo') {
        const photos = msg.photo;
        const photo = photos[photos.length - 1]; // 获取最高分辨率的照片
        fileId = photo.file_id;
        fileName = `${fileId}.jpg`; // 自定义照片文件名
    }

    try {
        // 获取文件的下载链接
        const file = await bot.getFile(fileId);
        const fileLink = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path}`;

        // 本地临时文件路径
        const localFilePath = path.resolve(__dirname, fileName);

        // 下载文件
        await downloadFile(fileLink, localFilePath);

        // 上传文件到阿里云OSS
        const fileUrl = await uploadFileToOSS(localFilePath, fileName);
        await bot.sendMessage(chatId, `文件上传成功: ${fileUrl}`);
    } catch (err) {
        console.error(err.stack);
        await bot.sendMessage(chatId, `操作失败: ${err.message}`);
    }
}
