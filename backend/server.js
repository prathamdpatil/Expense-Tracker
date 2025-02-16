const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("../backend/config/db");
const userRoutes = require('./routes/usersRoutes');
const categoryRoutes = require('./routes/categories')
const expenseRoutes = require('./routes/expenseRoutes')
const statsRoutes = require('./routes/stateRoutes')

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/user', userRoutes);

app.use('/api/category', categoryRoutes)

app.use("/api/expenses", expenseRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/expenses/:id", expenseRoutes);

app.use("/api//expenses/bulk", expenseRoutes);

app.use("/api/stats", statsRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
