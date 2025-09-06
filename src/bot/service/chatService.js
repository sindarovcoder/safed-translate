const { operationSteps } = require("../../steps");
const _ = require("lodash");
const chatStates = {};

function getKeyByValue(obj, value) {
  return Object.keys(obj).find((key) => obj[key] === value);
}

function switchOperation(chatId, operation, operationData) {
  let data = {};

  if (operationSteps[operation]) {
    data[operation] = { step: 0, data: {}, ...operationData };
  }
  chatStates[chatId] = {
    operation,
    data,
    next: false,
    yes: true,
    // language: chatStates[chatId].language,
  };
}

// next 代表是否继续下一步
function resetChatState(chatId) {
  const chatState = chatStates[chatId];
  chatStates[chatId] = {
    operation: "START",
    data: {},
    next: false,
  };
  if (chatState?.language) {
    chatStates[chatId].language = chatState.language;
  }
}

function getChatNext(chatId) {
  const chatState = chatStates[chatId];
  return _.get(chatState, `next`);
}

function setChatNext(chatId, value) {
  chatStates[chatId].next = value;
}

function getChatState(chatId) {
  if (!chatStates[chatId]) {
    resetChatState(chatId);
  }
  return chatStates[chatId];
}

function setProcessField(chatId, step, value) {
  const chatState = chatStates[chatId];
  const operation = chatState.operation;
  chatState.data[operation].data[operationSteps[operation][step].field] = value;
}

function getOperateData(chatId) {
  const chatState = chatStates[chatId];
  return _.get(chatState, `data.${chatState.operation}.data`);
}

function getStep(chatId) {
  const chatState = chatStates[chatId];
  return _.get(chatState, `data.${chatState.operation}.step`);
}

module.exports = {
  getKeyByValue,
  switchOperation,
  resetChatState,
  getChatNext,
  setChatNext,
  getChatState,
  setProcessField,
  getOperateData,
  getStep,
  chatStates,
};
