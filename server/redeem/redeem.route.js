const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");

const upload = multer({
  storage,
});

const RedeemController = require("./redeem.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//get list of unaccepted redeem request
router.get("/unaccepted/:agency_id", RedeemController.unacceptedRequest);

//get list of accepted redeem request
router.get("/accepted/:agency_id", RedeemController.acceptedRequest);
router.post("/", RedeemController.store);

//accept redeem request
router.patch(
  "/:redeem_id",
  upload.single("image"),
  RedeemController.acceptRedeemRequest
);

//decline redeem request
router.patch("/decline/:redeem_id", RedeemController.declineRedeemRequest);

//agency wise pending redeem request
router.get("/agencyPending", RedeemController.agencyWisePendingRequest);

//agency wise accepted redeem request
router.get("/agencyAccepted", RedeemController.agencyWiseAcceptedRequest);

//get host redeem request
router.get("/host", RedeemController.getHostRedeemRequest);

//delete pending redeem request
router.delete("/:redeem_id", RedeemController.destroy);

module.exports = router;
