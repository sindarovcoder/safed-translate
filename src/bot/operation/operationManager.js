// reason dependacy injection
module.exports = {
  handleStepOperationReply,
  processFinalStep,
  handleOperationStart,
  handleSimpleOperation,
  handleProcess,
};

const bot = require("../core/bot");
const {
  generateKeyboard,
  mainMenuKeyboard,
  startKeyboard,
  webAppKeyboard,
  logOutKeyboard,
  keyboards,
  back
} = require("../../config/keyboards");
const { operationSteps, getRegions, getPvzAddress } = require("../../steps");
const {
  chatStates,
  getOperateData,
  switchOperation,
  setChatNext,
  getStep,
  setProcessField,
  getChatNext,
  resetChatState,
  getChatState,
} = require("../service/chatService");
const {
  handleAddAddress,
  sendChinaAddress,
  handleOurAddress,
  switchAddOurAddressMap,
  switchOurAddress,
} = require("./addressOperation");

const { handleRegister, handleLogin } = require("./authOperation");
const { sendConfig } = require("./botConfigOperation");
const { handleComment } = require("./commentOperation");
const {
  handleCreateOrder,
  handleGetOrder,
  handleGetUnPaidOrder,
} = require("./orderOperation");
const { handleBankORCash } = require("./paymentOperation");
const {
  profileHandler,
  authHandler,
  orderHandler,
  addressHandler,
} = require("../../apis");
const { validateTrackingNumbers } = require("../../base/utils");
const i18n = require("../../config/i18n");
const { getClientInfo } = require("../../apis/auth");

async function handleStepOperationReply(chatId, operation, step) {
  const reply = operationSteps[operation][step];

  if (reply.replyKeyboards) {
    const keyboard = reply.replyKeyboards.map((key) => [
      { text: i18n.__(key) },
    ]);
    // let keyboard = reply.replyKeyboards

    // await bot.sendMessage(chatId, i18n.__(reply.prompt), keyboard())
    await bot.sendMessage(chatId, i18n.__(reply.prompt), {
      reply_markup: {
        keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });

    // Add new adress
  } else if (reply.addressKeyboards) {
    const chatState = chatStates[chatId];

    if (_.isEmpty(chatState.data.ADD_ADDRESS.options)) {
      const newStep =
        operationSteps.ADD_ADDRESS.findLastIndex(
          (step) => step.addressKeyboards,
        ) + 1;

      chatState.data.ADD_ADDRESS.step = newStep;

      return await bot.sendMessage(
        chatId,
        i18n.__(operationSteps[operation][newStep].prompt),
        { reply_markup: { remove_keyboard: true } },
      );
    }

    const keyboard = generateKeyboard(chatState.data.ADD_ADDRESS.options);
    await bot.sendMessage(chatId, i18n.__(reply.prompt), {
      reply_markup: {
        keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });

  } else {
    await bot.sendMessage(chatId, i18n.__(reply.prompt), { parse_mode: "HTML" });
  }
}

async function processFinalStep(chatId, operation) {
  const data = getOperateData(chatId);

  switch (operation) {
    case "REGISTER":
      await handleRegister(chatId, data);
      break;
    case "ADD_ADDRESS": 2989

      // const fileId = process.env.REGISTER_VIDEO_FILE_ID;
      // await bot.sendVideo(chatId, fileId, {}, {});
      await sendConfig(chatId, operation);
      await handleAddAddress(chatId, data);
      await sendChinaAddress(chatId);
      break;
    case "OUR_ADDRESS":
      await handleOurAddress(chatId, data);
      break;
    case "LOGIN":
      await handleLogin(chatId, data);
      break;
    case "SIMPLE_CREATE_ORDER":
    case "CREATE_ORDER":
      await handleCreateOrder(chatId, data);
      break;
    case "COMMENT":
      await handleComment(chatId, data);
      break;
    case "BANK_CARD_OR_CASH":
      await handleBankORCash(chatId, data);
      break;
    case "SEARCH_ORDER":
      await handleGetOrder(chatId, data.trackingNumber);
      break;
    default:
      break;
  }
}

async function handleOperationStart(chatId, curOperation, data) {

  switchOperation(chatId, curOperation, data);

  if (operationSteps[curOperation]) {
    const chatState = getChatState(chatId);

    if (curOperation === "ADD_ADDRESS") {
      chatState.data.ADD_ADDRESS.options = await getRegions(chatId);
    }

    if (curOperation === "OUR_ADDRESS") {
      const user = await profileHandler.getProfile(chatId, true);

      let msg = i18n.__("pvz_address", {
        address: user?.pvz?.fullAddress,
        name: user?.pvz?.name,
      });


      if (!user?.pvz?.isActive) {
        msg = "\n\n" + i18n.__("pvz_close");
      }

      if (user.pvzId) {
        if (process.env.BOT_TYPE == "P2C") {
          return switchAddOurAddressMap(
            chatId,
            chatState.data.OUR_ADDRESS.message_id,
            "change",
            msg,
          );
        } else {
          return bot
            .sendMessage(chatId, msg, {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: i18n.__("change"),
                      callback_data: "CHANGE_PVZ",
                    },
                  ],
                ],
                resize_keyboard: true,
                one_time_keyboard: false,
              },
            })
            .then((sentMessage) => {
              chatState.data.OUR_ADDRESS.oldMessageId = sentMessage.message_id; // Yuborilgan xabar ID'sini saqlaymiz
            });
        }
      } else {
        if (process.env.BOT_TYPE == "P2C") {
          return switchAddOurAddressMap(
            chatId,
            chatState.data.OUR_ADDRESS.message_id,
          );
        }

        chatState.data.OUR_ADDRESS.options = await getPvzAddress(chatId);
      }
    }

    if (curOperation == "SIMPLE_CREATE_ORDER") {
      const user = await profileHandler.getProfile(chatId, true);

      if (!user?.pvz) {
        await switchOurAddress(chatId);
        return setChatNext(chatId, true);
      }

      let msg = i18n.__("pvz_address", {
        name: user?.pvz?.name,
        address: user?.pvz?.fullAddress,
      });

      if (!user?.pvz?.isActive) {
        msg = "\n\n" + i18n.__("pvz_close");
      }

      await bot.sendMessage(chatId, msg, { parse_mode: "HTML" });
    }

    if (curOperation === "REGISTER") {
      // chatState.data.REGISTER.data.name = `${msg.chat.first_name} ${msg.chat.last_name}`;
      chatState.data.REGISTER.data.type = process.env.BOT_TYPE;
      if (process.env.BOT_TYPE === "P2C") {
        //P2C 不需要邀请码x
        chatState.data[curOperation].step = 1;
        return handleStepOperationReply(chatId, curOperation, 1);
        return;
      }
    }

    await bot.deleteMessage(chatId, data.message.message_id);
    return handleStepOperationReply(chatId, curOperation, 0)

  }

  await Promise.all([
    // data?.message?.message_id ? bot.deleteMessage(chatId, data.message.message_id) : Promise.resolve(null),
    handleSimpleOperation(chatId, curOperation, data)
  ])

}

async function handleSimpleOperation(chatId, operation, data) {

  let text;
  const message_id = data?.message?.message_id || data?.message_id;
  const name = data?.message?.from?.first_name || data?.from?.first_name;

  switch (operation) {
    case "OCR":
      text = i18n.__("ocr.title") +
        "\n\n" +
        i18n.__("ocr.trigger") +
        "\n\n" +
        i18n.__("ocr.privateChat.description") +
        "\n" +
        i18n.__("ocr.privateChat.instruction") +
        "\n\n" +
        i18n.__("ocr.group.description") +
        "\n" +
        i18n.__("ocr.group.instruction")
      break;
    case "TRANSLATE":
      text = i18n.__("translate.title") +
        "\n\n" +
        i18n.__("translate.trigger") +
        "\n" +
        i18n.__("translate.usage.general") +
        "\n" +
        i18n.__("translate.usage.example1") +
        "\n" +
        i18n.__("translate.usage.generalShort") +
        "\n" +
        i18n.__("translate.usage.example2") +
        "\n" +
        i18n.__("translate.usage.reply") +
        "\n\n" +
        i18n.__("translate.example.input") +
        "\n\n" +
        i18n.__("translate.example.output");
      break;
    case "PAID_ORDERS":
      await orderHandler.getPaidOrders(chatId);
      break;
    case "PROFILE":
      const profile = await profileHandler.getProfile(chatId);
      await bot.sendMessage(chatId, profile, logOutKeyboard());
      break;
    case "ADDRESS":
      const address = await addressHandler.getDefaultAddress(chatId);
      await bot.sendMessage(chatId, address, { parse_mode: "HTML" });
      break;
    case "CHINA_ADDRESS":
      await sendChinaAddress(chatId);
      break;
    case "BACK":
      return await bot.editMessageText(i18n.__('welcome', { name, join_link: process.env.JOIN_LINK }),
        mainMenuKeyboard({ message_id, chat_id: chatId }),
      );
    default:
      break;
  }

  await bot.editMessageText(text, back({ chat_id: chatId, message_id }));

}

async function handleProcess(chatId, operation, text) {

  const chatState = chatStates[chatId];

  const step = getStep(chatId);

  if (operationSteps[operation][step].addressKeyboards) {
    const currentOptions = chatState.data.ADD_ADDRESS.options;

    const selection = currentOptions.find(
      (child) => child.nameUz === text || child.id == text,
    );

    if (!selection?.id) {
      return await handleStepOperationReply(chatId, operation, getStep(chatId));
    }

    chatState.data.ADD_ADDRESS.options = selection.children;

    setProcessField(chatId, step, selection.id);
  } else if (operationSteps[operation][step].ourressKeyboards) {
    if (text === "CHANGE_PVZ") {
      bot.deleteMessage(chatId, chatState.data.OUR_ADDRESS.oldMessageId);

      return await switchOurAddress(chatId);
    }
    const currentOptions = chatState.data.OUR_ADDRESS.options;

    const selection = currentOptions.find(
      (child) => child.nameUz === text || child.id == text,
    );

    chatState.data.OUR_ADDRESS.options = selection.children;

    setProcessField(chatId, step, selection.id);
  } else {
    setProcessField(chatId, step, text);
  }

  if (operation == "COMMENT") {
    await processFinalStep(chatId, operation);
    return;
  }

  if (
    operation === "REGISTER" &&
    operationSteps[operation][step].field === "companyCode"
  ) {
    const regex = /^\d{3}$/;
    if (!regex.test(chatState.data.REGISTER.data.companyCode)) {
      await bot.sendMessage(chatId, i18n.__("company_code_error"));
      await handleStepOperationReply(chatId, operation, getStep(chatId));
      return;
    }
    const company = await authHandler.getCompany(
      chatId,
      chatState.data.REGISTER.data.companyCode,
    );
    if (!company?.id) {
      await bot.sendMessage(chatId, i18n.__("company_code_error"));
      await handleStepOperationReply(chatId, operation, getStep(chatId));
      return;
    }
  }

  if (
    operation === "REGISTER" &&
    operationSteps[operation][step].field === "passportNo"
  ) {
    const regex = /^[A-Z]{2}\d{7}$/;
    if (!regex.test(chatState.data.REGISTER.data.passportNo)) {
      await bot.sendMessage(chatId, i18n.__("passport_no_error"));
      await handleStepOperationReply(chatId, operation, getStep(chatId));
      return;
    }
  }

  if (
    operation === "REGISTER" &&
    operationSteps[operation][step].field === "phoneNumber"
  ) {
    const regex = /^\d{9}$/;
    if (!regex.test(chatState.data.REGISTER.data.phoneNumber)) {
      // await bot.sendMessage(chatId, i18n.__("phone_number_error"));
      await handleStepOperationReply(chatId, operation, getStep(chatId));
      return;
    }
    try {
      await authHandler.sendVerificationCode(
        chatId,
        chatState.data.REGISTER.data.phoneNumber,
        chatState.data.REGISTER.data.companyCode,
      );
    } catch (error) {
      await bot.sendMessage(chatId, i18n.__(error?.message));
      await handleStepOperationReply(chatId, operation, getStep(chatId));
      return;
    }
  }
  if (
    operation === "REGISTER" &&
    operationSteps[operation][step].field === "verificationCode"
  ) {
    try {
      const { token } = await authHandler.verifyCodeLogin(
        chatId,
        chatState.data.REGISTER.data.phoneNumber,
        chatState.data.REGISTER.data.verificationCode,
      );

      if (token);
      const client = await getClientInfo(chatId);
      chatState.language = client.language;
      await i18n.setLocale(client.language);
      return await bot.sendMessage(
        chatId,
        i18n.__("login_successful"),
        mainMenuKeyboard(),
      );
    } catch (error) {
      await bot.sendMessage(chatId, i18n.__("verification_code_error"));
      return await handleStepOperationReply(chatId, operation, getStep(chatId));
    }
  }

  //
  if (
    operation === "REGISTER" &&
    operationSteps[operation][step].field === "name"
  ) {
    const regex =
      /^[A-Za-zÇçĞğİıÖöŞşÜüА-Яа-яЁёҚқҲҳЎўҲҳҒғ]{2,} [A-Za-zÇçĞğİıÖöŞşÜüА-Яа-яЁёҚқҲҳЎўҲҳҒғ]{2,}$/;
    if (!regex.test(chatState.data.REGISTER.data.name)) {
      await handleStepOperationReply(chatId, operation, getStep(chatId));
      return;
    }
  }

  if (operationSteps[operation][step].field === "trackingNumber") {
    const orderType =
      chatState.data.SIMPLE_CREATE_ORDER || chatState.data.SEARCH_ORDER;

    if (!validateTrackingNumbers(orderType.data.trackingNumber)) {
      await bot.sendMessage(chatId, i18n.__("trackingNumber_error"));
      return await handleStepOperationReply(chatId, operation, getStep(chatId));
    }
  }

  if (operation === "MERGED_TRACK_NUMBERS") {
    const data = await orderHandler.getUnPaidOrders(chatId, true);

    const grouped = groupedData(data);
  }

  if (operation === "BANK_CARD_OR_CASH" && typeof text === "string") {
    return await bot.sendMessage(chatId, i18n.__("steps.CashPay.messeng"));
  }

  //todo valid VerificationCode

  if (step < operationSteps[operation].length - 1) {
    chatState.data[operation].step++;

    await handleStepOperationReply(chatId, operation, getStep(chatId));
  } else {
    await processFinalStep(chatId, operation);

    if (getChatNext(chatId)) {
      setChatNext(chatId, false);
    } else {
      resetChatState(chatId);
    }
  }
}
