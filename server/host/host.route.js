const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = require("../../util/multer");

const HostController = require("./host.controller");

const upload = multer({
  storage,
});

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//get list of host
router.get("/", HostController.index);

//get agency wise host count and total earning [for main admin]
router.get("/agencyWiseHostCount", HostController.agencyWiseHostCount);


//get list of host agency wise
router.get("/agency/:agency_id", HostController.agencyWiseHost);

//get profile of host [android]
router.get("/profile", HostController.getProfile);

//get level of host
router.get("/level", HostController.getLevel);

//random host for match [android]
router.get("/random", HostController.randomHost);

//block unblock host
router.get("/blockUnblock/:host_id", HostController.blockUnblockHost);

//create host
router.post("/", upload.single("image"), HostController.store);

//update host
router.patch("/:host_id", upload.single("image"), HostController.update);

//host login [android]
router.post("/login", HostController.login);

//host is online [android]
router.post("/online", HostController.hostIsOnline);

//host is live [android]
router.post("/live", HostController.hostIsLive);

//remove host from live [android]
router.get("/unlive", HostController.hostIsUnLive);

//host is offline [android]
router.get("/offline", HostController.hostIsOffline);

//host is busy (connect call) [android]
router.get("/connect", HostController.hostIsBusy);

//host is free (disconnect call) [android]
router.get("/disconnect", HostController.hostIsFree);

//analytic of host for android
router.get("/android", HostController.hostAnalytic);

//analytic of gift and call [earning report]
router.get("/analytic/:host_id", HostController.callGiftAnalytic);

//analytic of live streaming [earning report]
router.get(
  "/analytic/liveStreaming/:host_id",
  HostController.liveStreamingAnalytic
);

//add extra bonus in host by admin
router.get("/bonus/:host_id", HostController.bonusSwitch);

//host logout
router.get("/logout", HostController.logout);

module.exports = router;
