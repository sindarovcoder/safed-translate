const i18n = require("../config/i18n");
const bot = require("../bot/core/bot");

exports.notification = async(req, res) => {
    
  caption = i18n.__(`notification.${req.body.type}`, {
    trackingNumber: req.body.trackingNumber, 
    waybillWeight: req.body.waybillWeight, 
    price: req.body.price, 
    remark: req.body.remark
  });
  await bot.sendMessage(req.body.chatId, caption, {parse_mode: "HTML"});
  res.sendStatus(200);
};