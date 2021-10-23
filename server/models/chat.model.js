const path = require("path");
const root = path.dirname(require.main.filename);
const messagesDbAddress = root + "/db/messages.json";
const usersDbAddress = root + "/db/users.json";
let messages = require(messagesDbAddress);
const users = require(usersDbAddress);

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
        message = {...meta, ...message};
        messages.push(message);
        writeToDb(messagesDbAddress, messages);
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
            .map((m) => ({seen: m.seenByTarget, sender: m.sender}))
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
        writeToDb(messagesDbAddress, messages);
        resolve()
    });

const getAllMessageTargets = async (userId) =>
    new Promise((resolve) => {
        const targetIds = messages.filter(m => m.chatId.includes(userId))
            .map(m => userId === m.target ? m.sender : m.target)
            .filter((t, i, self) => i === self.findIndex(t1 => t1 === t))
        let targets = []
        targetIds.forEach(id => {
            let u = users.find(u => u.id === id)
            if (u) {
                targets.push(u)
            }
        })

        targets = targets.map(t => ({id: t.id, nickname: t.nickname}))
        resolve(targets)
    })

module.exports = {
    getMessages,
    addMessage,
    hasUnreadMessages,
    markMessagesAsSeen,
    getAllMessageTargets
};
