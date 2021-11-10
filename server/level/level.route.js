const express = require("express");
const router = express.Router();

const LevelController = require("./level.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

router.get("/", LevelController.index);
router.post("/", LevelController.store);
router.patch("/:level_id", LevelController.update);
router.delete("/:level_id", LevelController.destroy);

module.exports = router;
