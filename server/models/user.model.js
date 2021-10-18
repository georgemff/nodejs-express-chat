const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const path = require("path");
const root = path.dirname(require.main.filename);
const filename = root + "/db/users.json";
let users = require(filename);

const {
  writeToDb,
  getUniqueId,
  getUsersConnection,
} = require("../helpers/helpers");

const createUserOrLogin = (data) =>
  new Promise(async (resolve, reject) => {
    const { nickname, password } = data;
    if (!nickname || !password) {
      reject({
        status: 400,
        message: "Invalid Data",
      });
    }
    const existingUser = await getUser(data); //{status: number, message: string, user?: user}
    if (existingUser.status === -1) {
      const id = { id: getUniqueId() };
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      data.password = hashedPassword;
      const user = { ...id, ...data };
      users.push(user);
      writeToDb(filename, users);
      const jwtToken = jwt.sign({ id }, process.env.TOKEN_KEY);
      resolve({
        status: 200,
        message: "User Created",
        user: {
          id: id,
          nickname: data.nickname,
          jwt: jwtToken,
        },
      });
    }
    if (existingUser.status === 0) {
      reject({
        status: 400,
        message: existingUser.message,
      });
    }

    const jwtToken = jwt.sign(
      { id: existingUser.user.id },
      process.env.TOKEN_KEY
    );
    resolve({
      status: 200,
      message: existingUser.message,
      user: {
        id: existingUser.user.id,
        nickname: existingUser.user.nickname,
        jwt: jwtToken,
      },
    });
  });

const getUser = async (data) => {
  const user = users.filter((u) => u.nickname === data.nickname)[0];
  if (!user) return { status: -1, message: "User Not Found" };
  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) return { status: 0, message: "Incorrect Password" };
  return {
    status: 1,
    user,
    message: "Success",
  };
};

const getUsersList = (userId) =>
  new Promise((resolve, reject) => {
    let activeConnections = getUsersConnection() || [];
    activeConnections = activeConnections
      .map((c) => c.id)
      .filter((id) => id !== userId);
    let activeUsers = [];
    for (let i = 0; i < activeConnections.length; i++) {
      let activeUser = users.filter(u => u.id === activeConnections[i])[0];
      if (activeUser && activeUser.id && activeUser.nickname)
        activeUsers.push({ id: activeUser.id, nickname: activeUser.nickname });
    }
    resolve({
      users: activeUsers,
    });
  });

module.exports = {
  createUserOrLogin,
  getUsersList,
};
