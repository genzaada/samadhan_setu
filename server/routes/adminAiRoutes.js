const express = require("express");
const { improveIssue } = require("../controllers/adminAiController");

const router = express.Router();

router.post("/improve-issue", improveIssue);

module.exports = router;
