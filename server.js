const express = require('express');
const path = require('path');
const passport = require('passport');
const expressSession = require('express-session');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Establishing port
const port = process.env.PORT || 5000;
const app = express();

// Database connection
require('./db/conn')();
const loginDetails = require('./db/loginDetails');
const { initializePassport, isAuthenticated } = require('./passportConfig');

// Setting up express session
app.use(expressSession({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
}));

// Passport setup
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files and views
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Homepage route
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/profile');
    } else {
        res.redirect('/signin');
    }
});

// Registration and login route
app.post('/signin', async (req, res) => {
    try {
        const { signUpFirstName, signUpLastName, signUpEmailID, signUpPassword } = req.body;

        if (signUpFirstName && signUpLastName && signUpEmailID && signUpPassword) {
            const existingUser = await loginDetails.findOne({ emailID: signUpEmailID });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            const profileList = new loginDetails({
                firstName: signUpFirstName,
                lastName: signUpLastName,
                emailID: signUpEmailID,
                password: signUpPassword,
            });

            await profileList.save();
            console.log("User registered successfully");
        } else {
            return res.status(400).json({ error: 'All fields are required' });
        }

        res.redirect('/');
    } catch (err) {
        console.error("An error occurred during registration:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Profile route
app.get('/profile', isAuthenticated, (req, res) => {
    const { firstName } = req.user;
    res.render('profile', { firstName });
});

// Logout route
app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
    console.log(`Your server is running at: http://localhost:${port}`);
});

