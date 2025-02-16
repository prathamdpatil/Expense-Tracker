const express = require("express");
const router = express.Router();
const expenseController = require("../controller/expenses");

router.get("/expenses", expenseController.getExpenses);
router.post("/expenses", expenseController.addExpense);
router.put("/expenses/:id", expenseController.updateExpense);
router.delete("/expenses/bulk", expenseController.deleteExpensesBulk);

module.exports = router;
