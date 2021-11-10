const express = require("express");
const router = express.Router();

const ChatController = require("./chat.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

router.post("/add", ChatController.store);
router.post("/userOldChat", ChatController.getUserOldChat);
router.post("/hostOldChat", ChatController.getHostOldChat);

module.exports = router;
