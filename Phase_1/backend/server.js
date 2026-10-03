const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const PORT = 3000;

// GET all expenses
app.get("/api/expenses", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date FROM expenses ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// GET expense by id
app.get("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(404).json({ error: "Expense not found" });
    }

    try {
        const result = await pool.query(
            "SELECT id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date FROM expenses WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// POST new expense
app.post("/api/expenses", async (req, res) => {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (Number(amount) <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO expenses (title, amount, category, date)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date`,
            [title, amount, category, date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});
// PUT update expense
app.put("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { title, amount, category, date } = req.body;

    if (!Number.isInteger(id)) {
        return res.status(404).json({ error: "Expense not found" });
    }

    if (!title || !amount || !category || !date) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (Number(amount) <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    try {
        const result = await pool.query(
            `UPDATE expenses
             SET title = $1, amount = $2, category = $3, date = $4
             WHERE id = $5
             RETURNING id, title, amount, category,
             TO_CHAR(date, 'YYYY-MM-DD') AS date`,
            [title, amount, category, date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});
// DELETE expense
app.delete("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(404).json({ error: "Expense not found" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM expenses WHERE id = $1 RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json({
            message: "Expense deleted successfully",
            expense: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


