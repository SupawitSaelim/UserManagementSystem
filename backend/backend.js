const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); 

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// สร้าง database connection
const db = new Database(path.join(__dirname, 'database.sqlite'), { verbose: console.log });

// เปิดใช้งาน Foreign Keys
db.pragma('foreign_keys = ON');

// สร้าง tables
function createTables() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT,
            zipcode TEXT
        );

        CREATE TABLE IF NOT EXISTS emails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            gender TEXT,
            email_id INTEGER,
            phone_id INTEGER,
            created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
            FOREIGN KEY (phone_id) REFERENCES contacts(id) ON DELETE CASCADE
        );
    `);
}

// Initialize database
createTables();

// Add user
app.post("/add", (req, res) => {
    try {
        const insertContact = db.prepare('INSERT INTO contacts (phone, zipcode) VALUES (?, ?)');
        const insertEmail = db.prepare('INSERT INTO emails (email) VALUES (?)');
        const insertUser = db.prepare('INSERT INTO users (name, gender, email_id, phone_id) VALUES (?, ?, ?, ?)');

        // Begin transaction
        const result = db.transaction(() => {
            const contact = insertContact.run(req.body.phone, req.body.zipcode);
            const email = insertEmail.run(req.body.email);
            const user = insertUser.run(req.body.name, req.body.gender, email.lastInsertRowid, contact.lastInsertRowid);
            return user.lastInsertRowid;
        })();

        res.json({
            id: result,
            message: 'User added successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users
app.get("/users", (req, res) => {
    try {
        const users = db.prepare(`
            SELECT 
                users.*, 
                emails.email, 
                contacts.phone, 
                contacts.zipcode
            FROM users
            JOIN emails ON users.email_id = emails.id
            JOIN contacts ON users.phone_id = contacts.id
        `).all();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user by id
app.get("/users/:id", (req, res) => {
    try {
        const user = db.prepare(`
            SELECT 
                users.*, 
                emails.email, 
                contacts.phone, 
                contacts.zipcode
            FROM users
            JOIN emails ON users.email_id = emails.id
            JOIN contacts ON users.phone_id = contacts.id
            WHERE users.id = ?
        `).get(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user
app.put('/update/:id', (req, res) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        db.transaction(() => {
            db.prepare('UPDATE contacts SET phone = ?, zipcode = ? WHERE id = ?')
                .run(req.body.phone, req.body.zipcode, user.phone_id);

            db.prepare('UPDATE emails SET email = ? WHERE id = ?')
                .run(req.body.email, user.email_id);

            db.prepare('UPDATE users SET name = ?, gender = ? WHERE id = ?')
                .run(req.body.name, req.body.gender, req.params.id);
        })();

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user
app.delete('/delete/:id', (req, res) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// HTML view
app.get("/", (req, res) => {
    try {
        const users = db.prepare(`
            SELECT 
                users.*, 
                emails.email, 
                contacts.phone, 
                contacts.zipcode
            FROM users
            JOIN emails ON users.email_id = emails.id
            JOIN contacts ON users.phone_id = contacts.id
        `).all();

        let html = '<html><head><title>User Data</title></head><body>';
        html += '<h1>User Data</h1>';
        html += '<table border="1">';
        html += '<tr><th>Name</th><th>Gender</th><th>Email</th><th>Phone</th><th>Zipcode</th><th>Created</th></tr>';

        users.forEach((user) => {
            html += '<tr>';
            html += `<td>${user.name}</td>`;
            html += `<td>${user.gender}</td>`;
            html += `<td>${user.email}</td>`;
            html += `<td>${user.phone}</td>`;
            html += `<td>${user.zipcode}</td>`;
            html += `<td>${user.created}</td>`;
            html += '</tr>';
        });

        html += '</table>';
        html += '</body></html>';

        res.send(html);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Close database connection when the app is terminated
process.on('SIGINT', () => {
    db.close();
    process.exit();
});