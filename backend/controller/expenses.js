const expenseService = require("../services/expenses");

const getExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getAllExpenses();
        res.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

const addExpense = async (req, res) => {
    try {
        let { user_id, category, amount, date, description } = req.body;

        if (!user_id || !category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        amount = Number(amount);
        if (isNaN(amount) || amount < 1 || amount > 999999999) {
            return res.status(400).json({ message: "Amount must be a number between 1 and 999999999" });
        }

        if (isNaN(Date.parse(date))) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        category = category.trim();
        description = description ? description.trim() : null;

        const expenseId = await expenseService.createExpense({ user_id, category, amount, date, description });

        res.status(201).json({ message: "Expense created successfully", expenseId });
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

const updateExpense = async (req, res) => {
    try {
        const expenseId = req.params.id;
        let { user_id, category, amount, date } = req.body;

        user_id = user_id || existingExpense.user_id;
        category = category || existingExpense.category;
        amount = amount !== undefined ? Number(amount) : existingExpense.amount;
        date = date || existingExpense.date;

        if (!user_id || !category || !amount || !date) {
            return res.status(400).json({ message: "All fields except description are required" });
        }


        if (isNaN(amount) || amount < 1 || amount > 999999999) {
            return res.status(400).json({ message: "Amount must be a number between 1 and 999999999." });
        }

        if (isNaN(Date.parse(date))) {
            return res.status(400).json({ message: "Invalid date format." });
        }

        const affectedRows = await expenseService.updateExpense(expenseId, { user_id, category, amount, date });

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Expense not found. Update failed." });
        }

        res.status(200).json({ message: "Expense updated successfully." });
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};


const deleteExpensesBulk = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Invalid request. IDs array required." });
        }

        const affectedRows = await expenseService.deleteExpensesBulk(ids);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "No expenses found for deletion." });
        }

        res.json({ message: `${affectedRows} expenses deleted successfully.` });
    } catch (error) {
        console.error("Error deleting expenses:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

module.exports = { getExpenses, addExpense, updateExpense,deleteExpensesBulk };
