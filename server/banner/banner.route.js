const express = require("express");
const router = express.Router();

const BannerController = require("./banner.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

router.use(checkAccessWithSecretKey());

//get list of banner
router.get("/", BannerController.index);

//create banner
router.post("/", upload.single("image"), BannerController.store);

//update banner
router.patch("/:banner_id", upload.single("image"), BannerController.update);

//delete banner
router.delete("/:banner_id", BannerController.destroy);

module.exports = router;
