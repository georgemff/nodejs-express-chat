const path = require("path");
const root = path.dirname(require.main.filename);
const filename = root + "/db/messages.json";
let messages = require(filename);

const {
  writeToDb,
  getDate,
  getUniqueId,
  getChatConnection,
} = require("../helpers/helpers");

const getMessages = (target, sender) =>
  new Promise((resolve, reject) => {
    if (Array.isArray(messages)) {
      resolve(
        messages.filter(
          (m) => m.chatId === sender + target || m.chatId === target + sender
        )
      );
    }
    reject({
      message: "Somesing Went Wrong!",
      status: 500,
    });
  });

const addMessage = (message, sender) =>
  new Promise((resolve) => {
    const meta = {
      id: getUniqueId(),
      chatId: sender + message.target,
      date: getDate(),
    };
    message = { ...meta, ...message };
    messages.push(message);
    writeToDb(filename, messages);
    const connections = getChatConnection().filter(
      (c) => c.id === message.target || c.id === sender
    );
    connections.forEach((c) =>
      c.ws.send(
        JSON.stringify(
          messages.filter((m) => {
            return (
              m.chatId === sender + message.target ||
              m.chatId === message.target + sender
            );
          })
        )
      )
    );
    resolve({
      status: 200,
      message: "Message Sent!",
    });
  });

module.exports = {
  getMessages,
  addMessage,
};
