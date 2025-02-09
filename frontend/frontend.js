const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path');
var bodyParser = require('body-parser');

const base_url = 'http://localhost:3000';

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
    try {
        const response = await fetchDataFromBackend();
        res.render('index', {
            users: response,
            message: req.query.message || ''
        });
    } catch (err) {
        console.error('Error fetching data:', err.message);
        res.render('index', {
            users: [],
            message: 'Error fetching data from server'
        });
    }
});

app.get('/add', (req, res) => {
    res.render('add_users', { 
        title: 'Add Users',
        message: ''
    });
});

app.post('/add', async (req, res) => {
    try {
        const newUser = {
            name: req.body.name,
            gender: req.body.gender,
            email: req.body.email,
            phone: req.body.phone,
            zipcode: req.body.zipcode,
        };
        
        await axios.post(`${base_url}/add`, newUser);
        res.redirect('/?message=User added successfully');
    } catch (err) {
        console.error('Error adding user:', err.message);
        res.render('add_users', {
            title: 'Add Users',
            message: 'Error adding user: ' + err.message
        });
    }
});

app.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${base_url}/users/${id}`);
        const user = response.data;

        if (!user) {
            return res.redirect('/?message=User not found');
        }

        console.log('User data:', user);

        res.render('edit_users', {
            title: 'Edit User',
            user: user,
            message: ''
        });
    } catch (err) {
        console.error('Error fetching user:', err.message);
        res.redirect('/?message=Error fetching user data');
    }
});

app.post('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = {
            name: req.body.name,
            gender: req.body.gender,
            email: req.body.email,
            phone: req.body.phone,
            zipcode: req.body.zipcode,
        };

        await axios.put(`${base_url}/update/${id}`, updatedUser);
        res.redirect('/?message=User updated successfully');
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.render('edit_users', {
            title: 'Edit User',
            user: { ...req.body, id: req.params.id },
            message: 'Error updating user: ' + err.message
        });
    }
});

app.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await axios.delete(`${base_url}/delete/${id}`);
        res.redirect('/?message=User deleted successfully');
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.redirect('/?message=Error deleting user');
    }
});

async function fetchDataFromBackend() {
    try {
        const response = await axios.get(`${base_url}/users`);
        return response.data;
    } catch (error) {
        console.error('Error in fetchDataFromBackend:', error.message);
        throw error;
    }
}

// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Frontend server started on port ${PORT}`);
});