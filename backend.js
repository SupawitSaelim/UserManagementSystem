const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();


mongoose.connect(
    "mongodb+srv://admin:admin@cluster0.gflf5ih.mongodb.net",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

const contactSchema = new mongoose.Schema({
    phone: {
        type: String
    },
    zipcode: {
        type: String
    }
});
const Contact = mongoose.model('Contact', contactSchema);

const emailSchema = new mongoose.Schema({
    email: {
        type: String
    }
});
const Email = mongoose.model('Email', emailSchema);

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    gender: {
        type: String,
    },
    email: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Email',
    },
    phone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
    },
    created: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('remove', async function (next) {
    try {
        await Contact.findByIdAndRemove(this.phone);
        await Email.findByIdAndRemove(this.email);
        next();
    } catch (err) {
        return next(err);
    }
});

const User = mongoose.model('User', userSchema);

const app = express();
app.use(bodyParser.json());

app.post("/add", async (req, res) => {
    try {
        const contact = new Contact({
            phone: req.body.phone,
            zipcode: req.body.zipcode,
        });

        const savedContact = await contact.save();

        const email = new Email({
            email: req.body.email,
        });

        const savedEmail = await email.save();

        const user = new User({
            name: req.body.name,
            gender: req.body.gender,
            email: savedEmail._id,
            phone: savedContact._id,
        });

        await user.save();
        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find().populate('phone').populate('email').populate('phone.zipcode');
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('phone').populate('email');
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = {
            name: req.body.name,
            gender: req.body.gender,
            email: req.body.email,
            phone: req.body.phone,
            zipcode: req.body.zipcode,
        };

        const user = await User.findById(id).populate('phone').populate('email');

        if (!user) {
            return res.json({ message: 'User not found', type: 'danger' });
        }

        let existingContact = await Contact.findOne({ phone: updatedUser.phone , zipcode: updatedUser.zipcode});

        let existingEmail = await Email.findOne({ email: updatedUser.email });

        if (!existingContact) {
            const newContact = new Contact({
                phone: updatedUser.phone,
                zipcode: updatedUser.zipcode
            });
            existingContact = await newContact.save();
        }

        if (!existingEmail) {
            const newEmail = new Email({
                email: updatedUser.email
            });
            existingEmail = await newEmail.save();
        }

        user.name = updatedUser.name;
        user.gender = updatedUser.gender;
        user.phone = existingContact._id;
        user.email = existingEmail._id;
        user.zipcode = updatedUser.zipcode;

        await user.save();

        res.json({ message: 'User updated successfully', type: 'success' });
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});



app.delete('/delete/:id', async (req, res) => {
    let id = req.params.id;
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.json({ message: 'User not found', type: 'danger' });
        }

        const contactId = user.phone;
        const emailId = user.email;

        await User.findByIdAndRemove(id);
        await Contact.findByIdAndRemove(contactId);
        await Email.findByIdAndRemove(emailId);

        req.session.message = {
            type: 'info',
            message: 'User and associated Contact deleted successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});


app.get("/", async (req, res) => {
    try {
        const users = await User.find().populate('phone').populate('email').populate('phone.zipcode');

        let html = '<html><head><title>User Data</title></head><body>';
        html += '<h1>User Data</h1>';
        html += '<table border="1">';
        html += '<tr><th>Name</th><th>Gender</th><th>Email</th><th>Phone</th><th>Zipcoade</th><th>Created</th></tr>';

        users.forEach((user) => {
            html += '<tr>';
            html += `<td>${user.name}</td>`;
            html += `<td>${user.gender}</td>`;
            html += `<td>${user.email.email}</td>`;
            html += `<td>${user.phone.phone}</td>`;
            html += `<td>${user.phone.zipcode}</td>`;
            html += `<td>${user.created}</td>`;
            html += '</tr>';
        });

        html += '</table>';
        html += '</body></html>';

        res.send(html);
    } catch (error) {
        res.status(500).send(error);
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
