const fs = require("fs");
let chatConnections = [];
let usersConnections = []
const writeToDb = (filename, data) => {
    fs.writeFileSync(filename, JSON.stringify(data));
};

const getDate = () => new Date().toString();

const getUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);

const addChatConnection = (ws) => chatConnections.push(ws);
const removeChatConnection = (id) => {
    chatConnections = chatConnections.filter(
        (ws) => ws.id !== id || ws.ws.readyState === 1
    );
};
const getChatConnection = () => chatConnections;


const addUsersConnection = (ws) => usersConnections.push(ws);
const removeUsersConnection = (id) => {
    usersConnections = usersConnections.filter(
        (ws) => ws.id !== id || ws.ws.readyState === 1
    );
};
const getUsersConnection = () => usersConnections.filter((ws) => ws.ws.readyState === 1);

module.exports = {
    writeToDb,
    getDate,
    getUniqueId,
    getChatConnection,
    addChatConnection,
    removeChatConnection,
    addUsersConnection,
    removeUsersConnection,
    getUsersConnection
};
