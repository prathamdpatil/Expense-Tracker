const express = require("express");
const router = express.Router();
const categoryController = require('../controller/categories');

router.get("/categories", categoryController.getCategories);

module.exports = router;