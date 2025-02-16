const express = require("express");
const router = express.Router();
const statsController = require("../controller/statsController");

router.get("/all-users", statsController.getAllUserStats);

module.exports = router;
