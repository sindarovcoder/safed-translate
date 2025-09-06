const operationManager = require("./operationManager");
const addressOperation = require("./addressOperation");
const orderOperation = require("./orderOperation");
const authOperation = require("./authOperation");
const commentOperation = require("./commentOperation");
const botConfigOperation = require("./botConfigOperation");
const startOperation = require("./startOperation");
const paymentOperation = require("./paymentOperation");

module.exports = {
  // operation manager
  ...operationManager,

  // start operation
  ...startOperation,

  // auth operation
  ...authOperation,

  // address operation
  ...addressOperation,

  // comment operation
  ...commentOperation,

  // bot config operation
  ...botConfigOperation,

  // order operation
  ...orderOperation,

  //payment operation
  ...paymentOperation,
};
