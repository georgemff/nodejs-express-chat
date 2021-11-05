const {getUsersDb, getMessagesDb} = require("../db/mongodb")

const {
    writeToDb,
    getDate,
    getUniqueId,
    getChatConnection,
} = require("../helpers/helpers");

const getMessages = (target, sender) =>
    new Promise(async (resolve, reject) => {
        const db = getMessagesDb();
        const messages = await db.find({
            "$or": [
                {chatId: sender + target},
                {chatId: target + sender}
            ]
        }).toArray();
        console.log(target, sender)
        console.log(messages)
        resolve(
            messages
        );
        reject({
            message: "Something Went Wrong!",
            status: 500,
        });
    });

const addMessage = (message, sender) =>
    new Promise(async (resolve, reject) => {
        const db = getMessagesDb();
        const meta = {
            id: getUniqueId(),
            chatId: sender + message.target,
            sender: sender,
            date: getDate(),
            seenByTarget: false,
        };
        message = {...meta, ...message};
        await db.insertOne(message).catch(e => reject(e))
        const connections = getChatConnection().filter(
            (c) => c.ws.readyState === 1 && (c.id === message.target || c.id === sender)
        );
        connections.forEach((c) =>
            c.ws.send(
                JSON.stringify({...meta, ...message}))
        );
        resolve({
            status: 200,
            message: "Message Sent!",
        });
    });

const hasUnreadMessages = async (userId) =>
    new Promise(async (resolve) => {
        const db = getMessagesDb()
        const messages = await db.find({
            target: userId,
            seenByTarget: false
        }).toArray();

        const unreadMessages = messages
            .map((m) => ({seen: m.seenByTarget, sender: m.sender}))
            .filter(
                (m, i, self) =>
                    i ===
                    self.findIndex((m1) => m.seen === m1.seen && m.sender === m1.sender)
            );
        resolve(unreadMessages);
    });

const markMessagesAsSeen = async (target, sender) =>
    new Promise(async (resolve) => {
        const db = getMessagesDb()
        await db.updateOne({
            target: target,
            sender: sender,
            seenByTarget: false
        }, {
            $set: {
                seenByTarget: true
            }
        })
        resolve()
    });

const getAllMessageTargets = async (userId) =>
    new Promise(async (resolve) => {
        const db = getMessagesDb();
        const messages = await db.find({}).toArray()
        const targetIds = messages.filter(m => m.chatId.includes(userId))
            .map(m => userId === m.target ? m.sender : m.target)
            .filter((t, i, self) => i === self.findIndex(t1 => t1 === t))
        let targets = []
        const usersDb = getUsersDb()
        for (let i = 0; i < targetIds.length; i++) {
            const [user] = await usersDb.find({id: targetIds[i]}).toArray()
            if (user) {
                targets.push(user)
            }
        }
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
