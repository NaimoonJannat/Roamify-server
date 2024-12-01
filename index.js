const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({
    origin: ['http://localhost:5173','https://roamify-client.vercel.app'],
    credentials: true
}));
app.use(express.json());

// MySQL connection setup
let db;
(async function initializeDb() {
    try {
        db = await mysql.createConnection({
            host: 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'new_projectdb',
        });
        console.log('Connected to MySQL database.');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit if the database connection fails
    }
})();

// Existing destinations routes
app.get('/api/destinations', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM destinations');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/destinations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM destinations WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Destination not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Users routes
app.post('/users', async (req, res) => {
    const data = req.body;

    try {
        console.log(data, "Received data successfully");

        const { name, email, role } = data;

        // Check if the email already exists in the 'users' table
        const [existingUser] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            // If the email exists, respond with a message that the user already exists
            console.log("User already exists with email:", email);
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        // If email does not exist, insert the new user into the 'users' table
        const [result] = await db.execute(
            'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
            [name, email, role || 'user'] // Default role is 'guest' if not provided
        );

        console.log("User inserted with ID:", result.insertId);
        res.status(201).json({ message: 'User added successfully', userId: result.insertId });
    } catch (error) {
        console.error("Error in /users endpoint:", error);
        res.status(500).json({ error: "An error occurred while processing your request" });
    }
});

app.get('/users', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
    }
});



app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !id) {
        return res.status(400).send('Invalid request, missing role or id');
    }

    try {
        const [result] = await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);

        if (result.affectedRows > 0) {
            return res.status(200).send('Role updated successfully');
        } else {
            return res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error updating user role:', err);
        return res.status(500).send('Error updating user role');
    }
});



// New packages routes
app.get('/packages', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM packages');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/packages', async (req, res) => {
    const { name, destination, date, img } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO packages (name, destination, date, img) VALUES (?, ?, ?, ?)',
            [name, destination, date, img]
        );
        res.status(201).json({ message: 'Package added', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/packages/:id', async (req, res) => {
    const { id } = req.params;
    const { name, destination, date, img } = req.body;
    try {
        await db.execute(
            'UPDATE packages SET name = ?, destination = ?, date = ?, img = ? WHERE id = ?',
            [name, destination, date, img, id]
        );
        res.status(200).json({ message: 'Package updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/packages/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM packages WHERE id = ?', [id]);
        res.status(200).json({ message: 'Package deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Roamify Server is Running');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
