const express = require("express");
const router = express.Router();

const LiveStreamingHistoryController = require("./liveStreamingHistory.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//create live streaming history when host is live
router.post("/", LiveStreamingHistoryController.store);

//start streaming
router.post("/start", LiveStreamingHistoryController.startStreaming);

module.exports = router;
