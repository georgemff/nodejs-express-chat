const express = require("express");
const router = express.Router();

const user = require("../models/user.model");
const { getUsersConnection } = require("../helpers/helpers");
const { route } = require("./chat.routes");

router.post("/login-or-register", async (req, res) => {
  await user
    .createUserOrLogin(req.body)
    .then((r) => {
      if (r.status === 200) {
        const usersConnections = getUsersConnection();
        console.log(usersConnections);
        usersConnections.forEach((u) => {
          u.ws.send();
        });
      }
      res.json(r);
    })
    .catch((err) => {
      res.status(err.status || 500).json({
        message: err.message,
      });
    });
});

router.get("/users/:userId", async (req, res) => {
  await user
    .getUsersList(req.params.userId)
    .then((r) => {
      res.json(r);
    })
    .catch((err) => {
      res.status(err.status || 500).json({
        message: err.message,
      });
    });
});

module.exports = router;
