const express = require("express");
const router = express.Router();

const ReportController = require("./report.controller");

var checkAccessWithSecretKey = require("../../checkAccess");

router.use(checkAccessWithSecretKey());

router.get("/:agency_id", ReportController.reportedUser);

router.get("/host/:host_id", ReportController.reportUser);

router.post("/", ReportController.store);

module.exports = router;
