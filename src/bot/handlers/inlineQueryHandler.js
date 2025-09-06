const { translate } = require("../../translate");

let timeout;

async function inlineQuery(bot, query) {
  const searchText = query.query.trim();

  if (!searchText) return;

  // Agar ilgari kiritilgan vaqtni kutish kerak bo'lsa, uni to'xtatamiz
  clearTimeout(timeout);

  // Yangi timeout yaratamiz
  timeout = setTimeout(async () => {
    try {
      const translatedTexts = await Promise.all([
        translate(searchText, { to: "uz" }), // O'zbek
        translate(searchText, { to: "en" }), // English
        translate(searchText, { to: "ru" }), // Russian
        translate(searchText, { to: "zh" }), // Chinese (Xitoy)
      ]);

      const translatedUz = translatedTexts[0];
      const translatedEn = translatedTexts[1];
      const translatedRu = translatedTexts[2];
      const translatedZh = translatedTexts[3];

      const results = [
        {
          type: "article",
          id: "0",
          title: `🇺🇿 O'zbek`,
          description: translatedUz.text,
          input_message_content: {
            message_text: translatedUz.text,
          },
        },
        {
          type: "article",
          id: "1",
          title: `🇺🇸 English`,
          description: translatedEn.text,
          input_message_content: {
            message_text: translatedEn.text,
          },
        },
        {
          type: "article",
          id: "2",
          title: `🇷🇺 Русский`,
          description: translatedRu.text,
          input_message_content: {
            message_text: translatedRu.text,
          },
        },
        {
          type: "article",
          id: "3",
          title: `🇨🇳 中文 (Chinese)`,
          description: translatedZh.text,
          input_message_content: {
            message_text: translatedZh.text,
          },
        },
      ];

      bot.answerInlineQuery(query.id, results);
    } catch (error) {
      console.error("Tarjima qilishda xatolik:", error);
    }
  }, 500); // 500 ms kutish, ya'ni foydalanuvchi so'nggi harfni yozgach 500 millisekund kutish
}

module.exports = { inlineQuery };


module.exports = { inlineQuery };
