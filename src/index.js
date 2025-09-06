try {
  require("dotenv").config();
  // require('./services/messageHandler');
  require("./server");
  // require("./bot")

  //   process.on("uncaughtException", (err) => {
  //     console.error(`There was an uncaught error: ${err.message}`);
  //     console.error(err.stack);
  //   });

  //   process.on("unhandledRejection", (err) => {
  //     console.error(`There was an unhandleRejection error: ${err.message}`);
  //     console.error(err.stack);
  //   });
} catch (err) {
  console.error(`There was an uncaught error: ${err.message}`);
  console.error(err.stack);
}
