
const { translate } = require("../../translate");

async function translateText(text, options) {
    const { text: translatedText } = await translate(text, options);
    return translatedText;
}

module.exports = translateText;