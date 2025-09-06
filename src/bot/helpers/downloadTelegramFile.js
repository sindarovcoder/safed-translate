const fs = require("fs");
const axios = require("axios");
const path = require("path");
const UPLOAD_DIR = path.join(__dirname, "../../documents");

/**
 * Downloads a file from Telegram servers to local storage
 * @param {object} fileData - Telegram file metadata object
 * @returns {Promise<{url: string, localFilePath: string, fileName: string}>} Download result
 */
async function downloadTelegramFile(bot, fileData) {
    if (!fileData?.file_id) {
        throw new Error('Invalid file data: missing file_id');
    }

    // Get file info from Telegram
    const file = await bot.getFile(fileData.file_id);
    if (!file?.file_path) {
        throw new Error('Telegram API error: missing file_path');
    }

    // Construct paths
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path}`;
    const fileName = path.basename(file.file_path);
    const localFilePath = path.join(UPLOAD_DIR, fileName);

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Download file
    const response = await axios({ url: fileUrl, responseType: 'stream' });

    await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(localFilePath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    return {
        url: fileUrl,
        localFilePath,
        fileName
    };
}


module.exports = downloadTelegramFile;