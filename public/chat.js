const chatParticipants = function (target) {
  this.target = target;
  this.sender = store.userId;
};

let _chatParticipants = {};
let authHeader;

const store = {};
(function () {
  getCurrentUser();

  authHeader = new Headers({
    "x-access-token": store.jwt,
  });
  openChatConnection();
  openActiveUsersConnection();
  addEventToWindow();

  const sendBtn = document.getElementById("send-btn");
  const messageTextbox = document.getElementById("messageTextbox");
  messageTextbox.addEventListener("keyup", function (e) {
    e.preventDefault();
    if (e.keyCode === 13) sendMessageOnClick();
  });
  sendBtn.addEventListener("click", function () {
    if (!_chatParticipants) {
      return;
    }

    if (!messageTextbox.innerText) {
      return;
    }

    sendMessageOnClick();
  });

  const sendMessageOnClick = () => {
    if (!_chatParticipants.target) {
      messageTextbox.innerText = "";
      messageTextbox.classList.add("incorrect");
      setTimeout(() => {
        messageTextbox.classList.remove("incorrect");
      }, 1000);
      return;
    }
    sendMessage({
      target: _chatParticipants.target,
      message: messageTextbox.innerText,
    }).catch((err) => {
      if (err.status === 401) {
        handleAuthError();
      }
      console.log(err);
    });
    messageTextbox.innerText = "";
  };
})();

async function sendMessage(data = {}) {
  const url = "http://localhost:8080/send-message";
  const response = await fetch(url, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": store.jwt,
    }),
    body: JSON.stringify(data),
  });
  return response.json();
}

async function hasUnreadMessages() {
  const url = `http://localhost:8080/has-unread-messages`;
  return fetch(url, { headers: authHeader });
}

async function getMessages(target) {
  const url = `http://localhost:8080/target/${target}`;
  return fetch(url, { headers: authHeader });
}

async function getUsers(userId) {
  const url = `http://localhost:8080/users/${userId}`;
  return fetch(url, { headers: authHeader });
}

async function markAsSeen(sender) {
  const url = `http://localhost:8080/mark-messages-as-seen/${sender}`;
  return fetch(url, { method: "PUT", headers: authHeader });
}
function getCurrentUser() {
  store.userId = window.localStorage.getItem("userId");
  store.jwt = window.localStorage.getItem("jwt");
}

function checkUnreadMessages() {
  hasUnreadMessages()
    .then((res) => res.json())
    .then((rj) => {
      if (rj && rj.length) {
        rj.forEach((m) => {
          if (m.sender) addRedCircleToElement(m.sender);
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function loadMessages(messages) {
  const body = document.getElementById("chat-body");
  body.innerHTML = "";
  const currentUserId = store.userId;
  const senderOrReciever = {
    RECIEVER: "reciever",
    SENDER: "sender",
  };
  messages.forEach((element) => {
    const span = document.createElement("span");
    span.classList.add("each-message");
    span.innerText = element.message;
    if (currentUserId !== element.target) {
      span.classList.add(senderOrReciever.SENDER);
    } else {
      span.classList.add(senderOrReciever.RECIEVER);
    }
    body.appendChild(span);
    let chatDiv = document.getElementById("chat-body");
    chatDiv.scrollTop = chatDiv.scrollHeight;
  });
}

function showActiveUsers() {
  const activeUsers = document.getElementById("active-users");
  activeUsers.innerHTML = "";
  const userId = store.userId;
  getUsers(userId)
    .then((r) => r.json())
    .then((res) => {
      res.users.forEach((u) => {
        let userId = `id-${u.id}`;
        activeUsers.appendChild(createUserElement(userId, u.nickname));
        addEventToUserElement(userId);
      });
      checkUnreadMessages();
    })
    .catch((err) => {
      if (err.status === 401) {
        handleAuthError();
      }
      console.error(err);
    });
}

function createUserElement(userId, nickname) {
  let div = document.createElement("div");
  let span = document.createElement("span");
  span.id = userId;
  span.innerText = nickname;
  div.appendChild(span);
  return div;
}

function addEventToUserElement(userId) {
  document.getElementById(userId).addEventListener("click", function () {
    chooseTarget(this);
  });
}

function chooseTarget(_this) {
  if (_chatParticipants.target) {
    document
      .getElementById("id-" + _chatParticipants.target)
      .classList.remove("active");
  }
  _chatParticipants = new chatParticipants(_this.id.slice(3));
  _this.classList.add("active");
  const redCircle = document.querySelector(`#${_this.id} > .red-circle`);
  if (redCircle) redCircle.remove();
  loadChatMessages();
}

function loadChatMessages() {
  getMessages(_chatParticipants.target)
    .then((r) => {
      return r.json();
    })
    .then((rj) => {
      loadMessages(rj);
      const lastMessage = rj[rj.length - 1];
      if (!lastMessage.seenByTarget && lastMessage.target === store.userId) {
        markMessagesAsSeen();
      }
    })
    .catch((err) => {
      if (err.status === 401) {
        handleAuthError();
      }
    });
}

function markMessagesAsSeen() {
  const sender = _chatParticipants.target;
  markAsSeen(sender).catch((err) => console.error(err));
}

function openChatConnection() {
  const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const echoSocketUrl =
    socketProtocol + "//" + "localhost:8080" + "/get-new-message/";
  const socket = new WebSocket(echoSocketUrl);

  socket.onopen = (e) => {
    console.log("Connected", e);
    socket.send(JSON.stringify({ id: store.userId }));
  };

  socket.onmessage = (e) => {
    try {
      const userId = store.userId;
      const data = JSON.parse(e.data);
      const m = data[0] || {};
      const target = m.sender === userId ? m.target : m.sender;
      if (_chatParticipants.target === target) {
        loadMessages(data);
        const lastMessage = data[data.length - 1];
        if (!lastMessage.seenByTarget && lastMessage.target === store.userId) {
          markMessagesAsSeen();
        }
      } else {
        addRedCircleToElement(target);
      }
      return false;
    } catch (e) {
      console.error(e);
    }
  };
  socket.onerror = (e) => console.log(e);

  socket.onclose = (e) => {
    console.log("Closed!", e);
  };
  addSocketToStore(socket);
}

function openActiveUsersConnection() {
  const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const echoSocketUrl =
    socketProtocol + "//" + "localhost:8080" + "/get-active-users/";
  const socket = new WebSocket(echoSocketUrl);

  socket.onopen = (e) => {
    console.log("Connected To Active Users!", e);
    socket.send(JSON.stringify({ id: store.userId }));
    setInterval(() => {
      socket.send(JSON.stringify({}));
    }, 120000);
    console.log("open");
    // showActiveUsers();
  };

  socket.onerror = (e) => {
    console.log(e);
  };

  socket.onmessage = () => {
    console.log("There Are Some New Users!^^");
    console.log("message");
    showActiveUsers();
  };
  addSocketToStore(socket);
}

function addEventToWindow() {
  window.addEventListener("beforeunload", function (e) {
    const sockets = store.sockets || [];
    sockets.forEach((s) => {
      console.log(s);
      s.close(4001, store.userId);
    });
  });
}

function addSocketToStore(socket) {
  store.sockets = [socket, ...(store.sockets || [])];
}

function handleAuthError() {
  console.log("handleAuthError");
  window.localStorage.removeItem("jwt");
  window.location.reload();
}

function addRedCircleToElement(target) {
  const span = document.getElementById(`id-${target}`);
  if(!span) {
    return;
  }
  const redCircle = document.createElement("span");
  redCircle.classList.add("red-circle");
  span.appendChild(redCircle);
}
