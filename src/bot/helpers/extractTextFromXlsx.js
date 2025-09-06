const XLSX = require("xlsx");
const fs = require('fs');

async function extractTextFromXlsx(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        return jsonData
            .map((row) => row.join(" ").trim())  // Har bir qatorni birlashtirish
            .filter((line) => line && !/^\d+$/.test(line))  // Bo'sh va faqat raqamlardan iborat qatorlarni olib tashlash
            .join("\n");
    } catch (error) {
        console.error("Xatolik:", error);
        return "";
    } finally {
        fs.unlinkSync(filePath);
    }
}

module.exports = extractTextFromXlsx;
