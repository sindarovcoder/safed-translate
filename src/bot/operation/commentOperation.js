const bot = require("../core/bot");
const { mainMenuKeyboard } = require("../../config/keyboards");
const { profileHandler } = require("../../apis");
const { chatStates } = require("../service/chatService");
const { feedbackGroupId } = require("../../base/utils");

const userMessageMap = new Map();

async function handleComment(chatId, msg) {
  let data;

  const chatState = chatStates[chatId];

  if (msg?.comment?.images) {
    data = {
      comment: msg?.comment.text ?? "",
      images: [msg?.comment?.images],
    };

  } else {
    data = msg;

    const userLink = `https://t.me/${chatState.data.COMMENT.from.username || chatState.data.COMMENT.from.id
      }`;

    const name =
      `<a href="${userLink}"><blockquote>` +
      chatState.data.COMMENT.from.first_name +
      "</blockquote></a>\n";

    const caption = name + msg?.comment;

    bot
      .sendMessage(feedbackGroupId, caption, { parse_mode: "HTML" })
      .then((data) => {
        userMessageMap.set(data.message_id, {
          chatId,
          replyMessageId: msg.message_id,
        });
      });
  }

  try {
    await profileHandler.commentPost(chatId, data);
  } catch (error) {
    await bot.sendMessage(chatId, error.message, mainMenuKeyboard());
  }
}

module.exports = { handleComment, userMessageMap };
