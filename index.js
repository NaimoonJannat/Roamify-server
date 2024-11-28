const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({
    origin: ['http://localhost:5173'],
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

// API to get all the destinations 
app.get('/api/destinations', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM destinations');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//API to get single destination using id 
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


// API to get all users
app.get('/users', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
    }
});

// API to add a new user
// app.post('/users', async (req, res) => {
//     const { name, email } = req.body;
//     try {
//         const [result] = await db.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
//         res.status(201).json({ message: 'User added successfully', id: result.insertId });
//     } catch (err) {
//         console.error('Error adding user:', err);
//         res.status(500).send('Error adding user');
//     }
// });



app.get('/', (req, res) => {
    res.send('Roamify Server is Running');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
