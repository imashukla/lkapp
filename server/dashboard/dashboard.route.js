const express = require("express");
const router = express.Router();

const DashboardController = require("./dashboard.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.get(checkAccessWithSecretKey());

router.get("/", DashboardController.index);
router.get("/agency/:agency_id", DashboardController.agencyDashboard);

module.exports = router;
