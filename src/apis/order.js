const { get, post } = require("./apiClient");
const i18n = require("../config/i18n");
// const bot = require("../services/botService");
const bot = require("../bot/core/bot");
const { formattedNumber, groupedData } = require("../base/utils");
const { keyboards, mainMenuKeyboard, track_number_merged } = require("../config/keyboards");

const authHandler = require("./auth");

const _ = require("lodash");

async function createOrder(chatId, params) {
  params.isValuable = params.isValuable === i18n.__("order.yes");

  const data = await post("/waybill", params, chatId);

  const trackingNumbers = data
    .map((waybill) => waybill.trackingNumber)
    .join(", ");
  return i18n.__("order.createSuccess", { trackingNumbers });
}

async function getUnPaidOrders(chatId, json = false) {

  const data = await get("/waybill", { s: { payStatus: "UN_PAID" } }, chatId);

  if (!data.length)
    return await bot.sendMessage(chatId, i18n.__("order.notFound"));

  if (json) {
    return data.slice(0, 10);
  }

  let returnData = {};
  const mergedIdGroups = groupedData(data);


  const keyboardGeneration = (item, key) => {
    const total = _.sumBy(item, "payAmountSom") * 100;

    const trackingNumbers = item?.map((item) => item.trackingNumber);

    const orderStatus = {
      clientId: data[0].clientCode,
      trackingNumbers,
    };

    returnData = { ...returnData, [key]: orderStatus };

    return {
      reply_markup: {
        inline_keyboard: item[item.length - 1]?.payType?.map((item) => [
          item.id === 0
            ? {
              text: item.label,
              url:
                process.env.PAYME_URL +
                btoa(
                  `m=${process.env.PAYME_MERCHAND_ID};a=${total};ac.trackingNumbers=${trackingNumbers};ac.clientId=${orderStatus?.clientId};l=uz`
                ),
            }
            : {
              text: item.label,
              callback_data: JSON.stringify({
                keyboard: keyboards().BANK_CARD_OR_CASH,
                key,
              }),
            },
        ]),
      },
      parse_mode: "HTML",
    };
    s;
  };

  const mergedIdGroup = [...Object.values(mergedIdGroups.groupedByMergedId), mergedIdGroups.nullMergedId];



  // mergedIdGroup.map(async (group) => {

  mergedIdGroup.map(async (item) => {

    const total = formattedNumber(_.sumBy(item, "payAmountSom"));

    let msg = item.slice(0, 10).reduce((acc, waybill) => {

      return (
        acc +
        `<blockquote>` + i18n.__("order.trackingNumber", {
          trackingNumber: waybill.trackingNumber,
        }) +
        "\n" +
        i18n.__("order.weight", { weight: waybill.weight }) +
        "\n" +
        i18n.__("order.freight", {
          freight: formattedNumber(waybill.payAmountSom),
        }) +
        "\n" +
        i18n.__("order.status") +
        i18n.__(`order.${waybill.status}`) +
        "\n\n" + '</blockquote>'
      );
    }, "") + `<blockquote>${i18n.__("order.totalAmount", { total })}</blockquote>`;

    let keyboard = null;

    if (!item[0].mergedId) {
      const extractedData = mergedIdGroups.nullMergedId.slice(0, 16).map(item => ({
        id: item.id,
        status: item.status,
        trackingNumber: item.trackingNumber
      }));
      const { token } = await authHandler.generateToken(chatId);

      keyboard = track_number_merged(token, extractedData)

    } else {
      msg = msg + '<blockquote>' + i18n.__("merged_track_numbers") + '</blockquote>'
      keyboard = keyboardGeneration(item, item[0].status)
    }

    if (item.length > 16) {
      msg = msg + '<blockquote>' + i18n.__("long_traking_numbers") + '</blockquote>'
    }

    await bot.sendMessage(
      chatId,
      msg,
      keyboard
    );
  });
  // })

  return returnData;
}

async function getPaidOrders(chatId) {
  const data = await get("/waybill", { s: { payStatus: "PAID" } }, chatId);
  if (!data.length)
    return await bot.sendMessage(chatId, i18n.__("order.notFound"));

  const changeData = changeOrderData(data);

  changeData.map(async (item) => {

    const total = formattedNumber(_.sumBy(item, "payAmountSom"));

    const msg =
      item.slice(0, 15).reduce((acc, waybill) => {
        return (
          acc +
          '<blockquote>' + i18n.__("order.trackingNumber", {
            trackingNumber: waybill.trackingNumber,
          }) +
          "\n" +
          i18n.__("order.weight", { weight: waybill.weight }) +
          "\n" +
          i18n.__("order.freight", {
            freight: formattedNumber(waybill.payAmountSom),
          }) +
          "\n" +
          i18n.__("order.status") +
          i18n.__(`order.${waybill.status}`) +
          "\n\n" + '</blockquote>'
        );
      }, "") + '<blockquote>' + i18n.__("order.totalAmount", { total }) + '</blockquote>';

    await bot.sendMessage(chatId, msg, { parse_mode: "HTML", ...mainMenuKeyboard() });
  });

  return;
}

async function getUnfinishedOrders(chatId) {
  const data = await get("/waybill", {}, chatId);

  if (!data.length) return i18n.__("order.notFound");

  return data.slice(0, 10).reduce((acc, waybill) => {
    return (
      acc + '<blockquote>' +
      i18n.__("order.trackingNumber", {
        trackingNumber: waybill.trackingNumber,
      }) +
      "\n" +
      i18n.__("order.status") +
      i18n.__(`order.${waybill.status}`) +
      "\n" +
      (waybill.weight
        ? i18n.__("order.weight", { weight: waybill.weight })
        : i18n.__("order.onlyWeight")) +
      "\n" +
      (waybill.freight
        ? i18n.__("order.freight", {
          freight: formattedNumber(waybill.payAmountSom),
        })
        : i18n.__("order.onlyFreight")) +
      "\n\n" + '</blockquote>'
    );
  }, "");
}

async function getOrder(chatId, trackingNumber) {
  const data = await get("/waybill", { s: { trackingNumber } }, chatId);
  if (!data.length) return i18n.__("order.notFound");

  const waybill = data[0];

  return (
    '<blockquote>' + i18n.__("order.trackingNumber", {
      trackingNumber: waybill.trackingNumber,
    }) +
    "\n" +
    i18n.__("order.status") +
    i18n.__(`order.${waybill.status}`) +
    "\n" +
    (waybill.weight
      ? i18n.__("order.weight", { weight: waybill.weight })
      : i18n.__("order.onlyWeight")) +
    "\n" +
    (waybill.freight
      ? i18n.__("order.freight", {
        freight: formattedNumber(waybill.payAmountSom),
      })
      : i18n.__("order.onlyFreight")) +
    "\n" + '</blockquote>'
  );
}

// function changeOrderData(waybills) {
//   const groupedByStatus = waybills.reduce((acc, waybill) => {
//     if (!acc[waybill.status]) {
//       acc[waybill.status] = [];
//     }
//     acc[waybill.status].push(waybill);
//     return acc;
//   }, {});

//   return Object.keys(groupedByStatus).map((status) => groupedByStatus[status]);

// }

function changeOrderData(waybills) {
  const groupedByStatus = waybills.reduce((acc, waybill) => {
    const status = waybill.status;

    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(waybill);

    return acc;
  }, {});

  return Object.keys(groupedByStatus).map((status) => groupedByStatus[status]);
}

module.exports = {
  createOrder,
  getOrder,
  getUnfinishedOrders,
  getUnPaidOrders,
  getPaidOrders,
};
