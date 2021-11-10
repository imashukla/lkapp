const express = require("express");
const router = express.Router();

const CallHistoryController = require("./callHistory.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//create call history when user or host do call
router.post("/", CallHistoryController.store);

//receive call
router.post("/receive", CallHistoryController.receiveCall);

//user call history
router.get("/user", CallHistoryController.userCallHistory);

//host call history
router.get("/host", CallHistoryController.hostCallHistory);

module.exports = router;
