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
      sender: sender,
      date: getDate(),
      seenByTarget: false,
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

const hasUnreadMessages = async (userId) =>
  new Promise((resolve) => {
    const unreadMessages = messages
      .filter((m) => m.target === userId && !m.seenByTarget)
      .map((m) => ({ seen: m.seenByTarget, sender: m.sender }))
      .filter(
        (m, i, self) =>
          i ===
          self.findIndex((m1) => m.seen === m1.seen && m.sender === m1.sender)
      );
    resolve(unreadMessages);
  });

const markMessagesAsSeen = async (target, sender) =>
  new Promise((resolve) => {
    messages = messages.map((m) => {
      if (m.target === target && m.sender === sender && !m.seenByTarget) {
        m.seenByTarget = true;
        return m;
      }
      return m;
    });
    writeToDb(filename, messages);
    resolve()
  });

module.exports = {
  getMessages,
  addMessage,
  hasUnreadMessages,
  markMessagesAsSeen,
};
