const express = require("express");
const bodyParser = require("body-parser");
// const bot = require("./services/botService");
const bot = require("./bot");
// const {b2cBot, p2cBot} = require('./services/botService');
const { notification } = require("./webhooks/index.js");
const { notificationValidation } = require("./validation/index.js");
const app = express();
app.use(bodyParser.json());

const { googleTranslateLanguages } = require("./base/languages");

const token = process.env.TOKEN;
// const P2C_TOKEN = process.env.P2C_TOKEN;

// const webhookUrl = `${process.env.WEBHOOK_URL}/bot${token}`;
// bot.setWebHook(webhookUrl);
//

// app.post(`/bot${P2C_TOKEN}`, (req, res) => {
//   bot.processUpdate(req.body);
//   res.sendStatus(200);
// });
//
app.post(`/bot${token}`, (req, res) => {
  // return 


  p2cBot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get(`/bot/5142f97c-994b-48f9-984a-5bbf215e68d0/languages`, (req, res) => {
  const languagesArray = Object.entries(googleTranslateLanguages).map(([code, lang]) => {
    return `.${code}: ${Object.values(lang)[0]}`;
  });

  const responseText = languagesArray.join(",\n  "); // Har bir elementni yangi qatorda chiqarish

  res.setHeader("Content-Type", "text/plain");
  res.send(responseText);
});


app.post(`/bot${token}/notification`, notificationValidation, notification);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express server is listening on port ${PORT}`);
});
