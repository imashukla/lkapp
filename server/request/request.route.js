const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = require("../../util/multer");

const RequestController = require("./request.controller");

const upload = multer({
  storage,
});

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//get list of request
router.get("/", RequestController.index);

//get agency wise host request list
router.get("/agency/:agency_id", RequestController.agencyWiseRequest);

//accept user request for becoming host
router.post("/:request_id", RequestController.enableHost);

//create user request for becoming host
router.post("/", upload.single("image"), RequestController.store);

module.exports = router;
