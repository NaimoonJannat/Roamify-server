const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// middleware 
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
  }));
  app.use(express.json())

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'new_projectdb',
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// API endpoint example
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

app.post('/users', (req, res) => {
    const { name, email } = req.body;
    db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send('User added successfully');
        }
    });
});

const PORT = 5000;
app.get('/', (req, res) => {
    res.send('Roamify Server is Running')
  })
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
