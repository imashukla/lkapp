const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = require("../../util/multer");

const upload = multer({
  storage,
});

const UserController = require("./user.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());
router.get("/online", UserController.isUserOnline);
router.get("/offline", UserController.isUserOffline);
router.get("/profile", UserController.getProfile);

router.get("/", UserController.index);
router.get("/level", UserController.getLevel);
router.get("/:user_id", UserController.blockUnblockUser);

router.post("/check_username", UserController.checkUsername);
router.post("/signup", UserController.store);
router.post(
  "/edit_profile",
  upload.single("image"),
  UserController.updateProfile
);

router.post("/less", UserController.lessCoin);
router.post("/add", UserController.addCoin);
router.post("/dailytask", UserController.dailyTask);
router.post("/checkdailytask", UserController.checkDailyTask);
router.post("/addplan", UserController.addPlan);

router.patch("/:user_id", upload.single("image"), UserController.update);

//update coin of user from admin panel
router.patch("/coin/:user_id", UserController.updateCoin);

router.delete("/logout", UserController.logout);

module.exports = router;
