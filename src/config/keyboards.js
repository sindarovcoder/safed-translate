const i18n = require("./i18n");

const { localesLanguage, generateRedirectWebAppUrl } = require("../base/utils");

const keyboards = () => ({
  CREATE_ORDER: i18n.__("keyboard.CREATE_ORDER"),
  SIMPLE_CREATE_ORDER: i18n.__("keyboard.SIMPLE_CREATE_ORDER"),
  MY_ORDERS: i18n.__("keyboard.MY_ORDERS"),
  SEARCH_ORDER: i18n.__("keyboard.SEARCH_ORDER"),
  UN_PAID_ORDERS: i18n.__("keyboard.UN_PAID_ORDERS"),
  PAID_ORDERS: i18n.__("keyboard.PAID_ORDERS"),
  COMMENT: i18n.__("keyboard.COMMENT"),
  BANK_CARD_OR_CASH: i18n.__("keyboard.BANK_CARD_OR_CASH"),
  ADDRESS: i18n.__("keyboard.ADDRESS"),
  CHINA_ADDRESS: i18n.__("keyboard.CHINA_ADDRESS"),
  ADD_ADDRESS: i18n.__("keyboard.ADD_ADDRESS"),
  PAY: i18n.__("keyboard.PAY"),
  CALL_CENTER: i18n.__("keyboard.CALL_CENTER"),
  OUR_ADDRESS: i18n.__("keyboard.OUR_ADDRESS"),
  DELETE_TRACKING: i18n.__("keyboard.DELETE_TRACKING"),
  SELECT_BRANCH: i18n.__("keyboard.SELECT_BRANCH"),
  PROFILE: i18n.__("keyboard.PROFILE"),
  REGISTER: i18n.__("keyboard.REGISTER"),
  LOGIN: i18n.__("keyboard.LOGIN"),
  LOGOUT: i18n.__("keyboard.LOGOUT"),
  CHANGE_PVZ: i18n.__("keyboard.CHANGE_PVZ"),
  CONFIRM_AGREE: i18n.__("subscription.confirmation"),
  SUBSCRIPTION_CHANNEL: i18n.__("subscription.instruction"),
  MERGED_TRACK_NUMBERS: i18n.__("keyboard.MERGED_TRACK_NUMBERS"),
  LANGUAGE: i18n.__("steps.language.choiceLang"),
  VIEW_ORDERS: i18n.__("keyboard.VIEW_ORDERS"),

  // for inline keyboard

  TRANSLATE: i18n.__("keyboard.TRANSLATE"),
  ADD_TO_GROUP: i18n.__("keyboard.ADD_TO_GROUP"),
  MY_LANG: i18n.__("keyboard.MY_LANG"),
  OCR: i18n.__("keyboard.OCR"),
  BACK: i18n.__("keyboard.BACK"),
})

const back = (params) => ({
  reply_markup: {
    inline_keyboard: [[{ text: keyboards().BACK, callback_data: keyboards().BACK }]],
    resize_keyboard: true,
    one_time_keyboard: true,
    remove_keyboard: true,
  },
  parse_mode: "HTML",
  ...params,
});

const startKeyboard = () => ({
  reply_markup: {
    keyboard: [[{ text: keyboards().REGISTER }]],
    // { text: keyboards().LOGIN }
    resize_keyboard: true,
    one_time_keyboard: true,
  },
  parse_mode: "HTML",
});



const mainMenuKeyboard = (params) => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: keyboards().ADD_TO_GROUP, url: "https://t.me/" + process.env.BOT_USERNAME + '?startgroup=' + process.env.BOT_USERNAME }],
      [
        { text: keyboards().TRANSLATE, callback_data: keyboards().TRANSLATE },
        { text: keyboards().OCR, callback_data: keyboards().OCR }
      ],
      [{ text: keyboards().MY_LANG, callback_data: keyboards().MY_LANG }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  },
  parse_mode: "HTML",
  ...params,
});

const afterRegisterKeyboard = () => ({
  reply_markup: {
    keyboard: [[{ text: keyboards().ADD_ADDRESS }]],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
});

const firstStartKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: keyboards().SUBSCRIPTION_CHANNEL,
          url: "https://t.me/abusahiytez/2", // Bu yerga shartlar sahifasining URL manzilini qo'ying
        },
      ],
      [
        {
          text: keyboards().CONFIRM_AGREE,
          callback_data: "__agree", // Bu yerga shartlar sahifasining URL manzilini qo'ying
        },
      ],
    ],
  },
  parse_mode: "HTML",
});

const track_number_merged = (token, data) => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: keyboards().MERGED_TRACK_NUMBERS,
            web_app: {
              url: `${process.env.WEB_PAGE_URL}merge-waybill?waybill=${btoa(
                JSON.stringify(data),
              )}&tokenKey=${token}`,
            },
          },
        ],
      ],
    },
    parse_mode: "HTML",
  };
};

const generateKeyboard = (options = [], step = 1) => {
  return options.map((child) => [
    { text: child.nameUz, callback_data: child?.id },
  ]);
};

// for change language
const languageKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      localesLanguage.map((lang) => ({
        text: i18n.__(`steps.language.${lang}`),
        callback_data: `${lang}`,
      })),
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
  parse_mode: "HTML",
});


const logOutKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [{
        text: keyboards().LOGOUT,
        callback_data: keyboards().LOGOUT,
      }]
    ],
    resize_keyboard: true,
    // one_time_keyboard: true,
  },
  parse_mode: "HTML",
});

const webAppKeyboard = (text, token, redirectPath) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text,
          web_app: {
            url: generateRedirectWebAppUrl(token, redirectPath, { language: i18n.getLocale() }),
          },
        },
      ],
    ],
  },
  parse_mode: "HTML",
});

module.exports = {
  keyboards,
  mainMenuKeyboard,
  afterRegisterKeyboard,
  startKeyboard,
  generateKeyboard,
  firstStartKeyboard,
  track_number_merged,
  languageKeyboard,
  back,
  webAppKeyboard,
  logOutKeyboard
};
