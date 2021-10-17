const express = require("express");
const router = express.Router();

const chat = require("../models/chat.model");
const auth = require("../middleware/auth");
router.get("/target/:target/", auth, async (req, res) => {
  await chat
    .getMessages(req.params.target, req.user.id)
    .then((messages) => res.json(messages))
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
    });
});

router.post("/send-message", auth, async (req, res) => {
  await chat
    .addMessage(req.body, req.user.id)
    .then((r) => res.json(r))
    .catch((err) =>
      res.status(500).json({
        message: err.message,
      })
    );
});

module.exports = router;
