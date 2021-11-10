const express = require("express");
const router = express.Router();

const FollowerController = require("./userFollower.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

router.post("/following", FollowerController.followingList);
router.post("/follower", FollowerController.followerList);
router.post("/follow", FollowerController.follow);
router.post("/unFollow", FollowerController.unFollow);
router.post("/checkFollow", FollowerController.checkIsFollow);

module.exports = router;
