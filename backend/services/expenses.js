const db = require("../config/db");

const getAllExpenses = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT e.id, e.user_id, e.category, e.amount, e.date, e.description
            FROM expenses e
            ORDER BY e.date DESC;
        `;
        db.query(query, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

const createExpense = ({ user_id, category, amount, date, description }) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO expenses (user_id, category, amount, date, description) 
            VALUES (?, ?, ?, ?, ?);
        `;
        db.query(query, [user_id, category, amount, date, description], (err, result) => {
            if (err) reject(err);
            else resolve(result.insertId);
        });
    });
};

const updateExpense = async (expenseId, { user_id, category, amount, date }) => {
    try {
        const query = `
            UPDATE expenses 
            SET user_id = ?, category = ?, amount = ?, date = ?
            WHERE id = ?;
        `;
      
        const [result] = await db.promise().query(query, [user_id, category, amount, date, expenseId]);

        return result.affectedRows;
    } catch (error) {
        console.error("Database Update Error:", error);
        throw error;
    }
};



const deleteExpensesBulk = (ids) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM expenses WHERE id IN (?)`;

        db.query(query, [ids], (err, result) => {
            if (err) reject(err);
            else resolve(result.affectedRows);
        });
    });
};

module.exports = { getAllExpenses,createExpense, updateExpense, deleteExpensesBulk };
