const express = require("express");
const router = express.Router();

const RedeemController = require("./agencyRedeem.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

const multer = require("multer");
const storage = require("../../util/multer");

const upload = multer({
  storage,
});

router.use(checkAccessWithSecretKey());

//get list of unaccepted redeem request
router.get("/unaccepted", RedeemController.unacceptedRequest);

//get list of accepted redeem request
router.get("/accepted", RedeemController.acceptedRequest);
//get agency wise redeem request
router.get("/:agency_id", RedeemController.agencyWiseRedeemRequest);

//create redeem request
router.post("/", RedeemController.store);

//update redeem request
router.patch("/:redeem_id", RedeemController.update);

//accept redeem request
router.put(
  "/:redeem_id",
  upload.single("image"),
  RedeemController.acceptRequest
);

//decline redeem request
router.patch("/decline/:redeem_id", RedeemController.declineRedeemRequest);

//delete pending redeem request
router.delete("/:redeem_id", RedeemController.destroy);

module.exports = router;
