const express = require("express");
const { body, param, validationResult } = require("express-validator");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

app.get("/", (req, res) => {
    res.send("MySQL Connection Successful!");
});

app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get("/categories", (req, res) => {
    db.query("SELECT * FROM categories", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get("/expenses", (req, res) => {
    const query = `
        SELECT e.id, e.user_id, e.category, e.amount, e.date, e.description
        FROM expenses e
        ORDER BY e.date DESC;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});

app.post("/expenses", (req, res) => {
    const { user_id, category, amount, date, description } = req.body;

    if (!user_id || !category || !amount || !date) {
        return res.status(400).json({ message: "All fields except description are required" });
    }

    const query = `
        INSERT INTO expenses (user_id, category, amount, date, description) 
        VALUES (?, ?, ?, ?, ?);
    `;

    db.query(query, [user_id, category, amount, date, description], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.status(201).json({ message: "Expense created successfully", expenseId: result.insertId });
    });
});

app.put("/expenses/:id", (req, res) => {
    const expenseId = req.params.id;
    const { user_id, category, amount, date, description } = req.body;

    if (!user_id || !category || !amount || !date) {
        return res.status(400).json({ message: "All fields except description are required" });
    }

    const query = `
        UPDATE expenses 
        SET user_id = ?, category = ?, amount = ?, date = ?, description = ? 
        WHERE id = ?;
    `;

    db.query(query, [user_id, category, amount, date, description, expenseId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json({ message: "Expense updated successfully" });
    });
});


app.delete("/expenses/bulk", async (req, res) => {
    const { ids } = req.body; 

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request. IDs array required." });
    }

    const sql = `DELETE FROM expenses WHERE id IN (?)`;

    db.query(sql, [ids], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${result.affectedRows} expenses deleted successfully` });
    });
});


app.get("/stats/top-3-days/:userId", [param("userId").isInt()], validate, (req, res) => {
    const sql = `
        SELECT date, SUM(amount) AS total_spent 
        FROM expenses 
        WHERE user_id = ? 
        GROUP BY date 
        ORDER BY total_spent DESC 
        LIMIT 3;
    `;
    db.query(sql, [req.params.userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get("/stats/monthly-change/:userId", 
    param("userId").isInt().withMessage("User ID must be an integer"), 
    validate, 
    (req, res) => {
        const sql = `
            SELECT 
                user_id,
                IFNULL(SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN amount ELSE 0 END), 0) AS prev_month,
                IFNULL(SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE) THEN amount ELSE 0 END), 0) AS current_month,
                CASE 
                    WHEN SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN amount ELSE 0 END) = 0 
                    THEN NULL 
                    ELSE 
                        ((SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE) THEN amount ELSE 0 END) -
                          SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN amount ELSE 0 END)) / 
                          SUM(CASE WHEN MONTH(date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN amount ELSE 0 END)) 
                        * 100
                END AS percentage_change
            FROM expenses
            WHERE user_id = ?
            GROUP BY user_id
        `;
        db.query(sql, [req.params.userId], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results.length > 0 ? results[0] : { message: "No data found for this user" });
        });
    }
);

app.get("/stats/predict-next-month/:userId", 
    param("userId").isInt().withMessage("User ID must be an integer"),
    validate,
    (req, res) => {
        const sql = `
            SELECT user_id, AVG(monthly_spent) AS predicted_next_month 
            FROM (
                SELECT user_id, SUM(amount) AS monthly_spent 
                FROM expenses 
                WHERE date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH) 
                GROUP BY user_id, MONTH(date)
            ) AS last_3_months 
            WHERE user_id = ?
            GROUP BY user_id;
        `;
        db.query(sql, [req.params.userId], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results.length > 0 ? results[0] : { message: "No data found for this user" });
        });
    }
);


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
