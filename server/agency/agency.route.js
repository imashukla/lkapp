const express = require("express");
const router = express.Router();

const AgencyController = require("./agency.controller");
const multer = require("multer");
const storage = require("../../util/multer");

const AgencyMiddleware = require("../middleware/AgencyMiddleware");

const upload = multer({
  storage,
});

//get profile of agency admin
router.get("/", AgencyMiddleware, AgencyController.getprofile);

//get particular agency [for android]
router.get("/get", AgencyController.getAgency);

//get all agency detail for main admin
router.get("/show", AgencyController.index);

//create agency
router.post("/", upload.single("image"), AgencyController.store);

//agency login
router.post("/login", AgencyController.login);

//update image of agency
router.patch(
  "/updateImage",
  AgencyMiddleware,
  upload.single("image"),
  AgencyController.updateImage
);

//update name of agency
router.patch("/edit", AgencyMiddleware, AgencyController.updateProfile);

//update all detail of agency by main admin
router.patch("/:agency_id", upload.single("image"), AgencyController.update);

//enable disable agency
router.patch("/enableDisable/:agency_id", AgencyController.enableDisableAgency);

//change password of agency
router.put("/", AgencyMiddleware, AgencyController.changePass);

//get total coin of agency
router.get("/getCoin/:agency_id", AgencyController.getTotalCoin);

module.exports = router;
