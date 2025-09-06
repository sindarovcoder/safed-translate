const pdfjsLib = require('pdfjs-dist');
const fs = require('fs');

async function extractTextFromPdf(pdfPath) {
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdfDocument = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        fullText += text + '\n';
    }

    fs.unlinkSync(pdfPath); // PDF faylini o'chirish

    return fullText;
}


module.exports = extractTextFromPdf;