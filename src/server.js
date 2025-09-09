const express = require("express");
const bot = require("./bot/core/bot");

const app = express();
const TOKEN = process.env.BOT_TOKEN;


bot.setWebHook(`${process.env.RENDER_EXTERNAL_URL}/webhook/${TOKEN}`);

app.post(`/webhook/${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.post(`/webhook`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/ret-time', (_, res) => {
  res.json({ time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🪄  Bot server is listening on port ${PORT}`);
});
