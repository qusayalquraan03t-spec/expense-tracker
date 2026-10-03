const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");

const app = express();

app.use(cors());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});
pool.connect()
    .then((client) => {
        console.log("Database connected successfully");
        client.release();
    })
    .catch((error) => {
        console.error("DATABASE CONNECTION ERROR:", error.message);
    });
const PORT = 3000;

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from Express" });
});

app.get("/api/expenses", (req, res) => {
    res.json([
        { id: 1, title: "Food", amount: 10 },
        { id: 2, title: "Transport", amount: 5 }
    ]);
});

app.get("/api/students", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM students ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
}
});
app.get("/api/students/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(404).json({ error: "Student not found" });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
    console.error("DATABASE ERROR:", error.message);
    res.status(500).json({ error: error.message });
}
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});