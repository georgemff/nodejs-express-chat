const express = require("express");
const ws = require("express-ws");
const app = express();
const cors = require("cors");
const {
  addChatConnection,
  removeChatConnection,
  addUsersConnection,
  removeUsersConnection,
  getUsersConnection,
} = require("./helpers/helpers");
ws(app);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require("./routes/chat.routes"));
app.use(require("./routes/user.routes"));

app.ws("/get-new-message", (ws, req) => {
  ws.on("message", (msg) => {
    if (JSON.parse(msg).id) {
      addChatConnection({ id: JSON.parse(msg).id, ws });
    }
  });

  ws.on("close", (code, id) => {
    removeChatConnection(id);
    console.log("Connection Close!", code, id);
  });
});

app.ws("/get-active-users", (ws, req) => {
  ws.on("message", (msg) => {
    const id = JSON.parse(msg).id;
    console.log("Connected To Active Users", id);
    if (id) {
      addUsersConnection({ id, ws });
    }
    const usersConnections = getUsersConnection();
    usersConnections.forEach((u) => {
      u.ws.send();
    });
  });

  ws.on("close", (code, id) => {
    removeUsersConnection(id);
    const usersConnections = getUsersConnection();
    usersConnections.forEach((u) => {
      u.ws.send();
    });
    console.log("Connection Close! {Active Users}");
  });
});

app.listen("8080");
