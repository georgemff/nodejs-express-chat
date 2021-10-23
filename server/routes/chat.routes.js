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

router.get("/has-unread-messages/", auth, async (req, res) => {
    await chat
        .hasUnreadMessages(req.user.id)
        .then((unreadMessages) => res.json(unreadMessages))
        .catch((err) => {
            res.status(400).json({
                message: err.message,
            });
        });
});

router.put("/mark-messages-as-seen/:sender", auth, async (req, res) => {
    await chat
        .markMessagesAsSeen(req.user.id, req.params.sender)
        .then(() => res.sendStatus(200))
        .catch((err) => {
            res.status(400).json({
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

router.get("/all-messages-targets", auth, async (req, res) => {
    await chat.getAllMessageTargets(req.user.id)
        .then((targets) => res.json(targets))
        .catch((err) => {
            res.status(400).json({
                message: err.message
            })
        })
})

module.exports = router;
