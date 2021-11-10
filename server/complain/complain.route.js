const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const ComplainController = require("./complain.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

//store complaint
router.post("/", upload.single("image"), ComplainController.store);

//get agency wise complain
router.get("/", ComplainController.agencyWiseComplainCount);

//get agency wise host complain list
router.get("/host", ComplainController.agencyWiseHostComplain);

//get user complain list
router.get("/user", ComplainController.userComplain);

//get host complain [for android]
router.get("/particular/host", ComplainController.hostComplainList);

//get user complain [for android]
router.get("/particular/user", ComplainController.userComplainList);
//solve complain
router.patch("/:complain_id", ComplainController.solveComplain);

module.exports = router;
