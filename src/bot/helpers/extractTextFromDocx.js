const mammoth = require("mammoth");
const fs = require('fs');

async function extractTextFromDocx(filePath) {
    try {
        const data = await mammoth.extractRawText({ path: filePath });
        return data.value.trim();
    } catch (error) {
        console.error("Xatolik:", error);
        return "";
    } finally {
        fs.unlinkSync(filePath);
    }
}


module.exports = extractTextFromDocx;