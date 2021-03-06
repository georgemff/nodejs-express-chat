const express = require("express");
const router = express.Router();

const user = require("../models/user.model");
const auth = require("../middleware/auth");
const {getUserById} = require("../models/user.model");


router.post("/login-or-register", async (req, res) => {
    await user
        .createUserOrLogin(req.body)
        .then((r) => {
            console.log(req.body, 'wtf')
            res.json(r);
        })
        .catch((err) => {
            console.log(req.body, 'wtf')
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

router.get("/user-info", auth, async (req, res) => {
    await getUserById(req.user.id)
        .then(r => {
            res.json(r)
        })
        .catch(err => {
            res.status(err.status || 500).json({
                message: err.message
            })
        })
})

module.exports = router;
