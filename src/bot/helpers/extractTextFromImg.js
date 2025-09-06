const Tesseract = require("tesseract.js");
const fs = require("fs");
const { OCR_LANGUAGES } = require("../../base/utils");

/**
 * Extracts text from scanned images using OCR
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} Extracted text
 */

async function extractTextFromImg(imagePath) {
    try {
        const { data } = await Tesseract.recognize(imagePath, OCR_LANGUAGES);
        return data.text;
    } catch (error) {
        console.error("❌ OCR error:", error);
    } finally {
        fs.unlinkSync(imagePath);
    }
}

module.exports = extractTextFromImg;