const express = require("express");
const childProcess = require("child_process");

const gitCommitHash = childProcess.execSync("git rev-parse --short HEAD");

const router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
	res.render("index", { title: `Race Condition (${gitCommitHash})` });
});

module.exports = router;
