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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Passport setup
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Static files and views
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

// Registration route
app.post('/register', async (req, res) => {
    try {
        const { signUpFirstName, signUpLastName, signUpEmailID, signUpPassword } = req.body;

        if (!signUpFirstName || !signUpLastName || !signUpEmailID || !signUpPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await loginDetails.findOne({ emailID: signUpEmailID });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(signUpPassword, 10);

        const profileList = new loginDetails({
            firstName: signUpFirstName,
            lastName: signUpLastName,
            emailID: signUpEmailID,
            password: hashedPassword,
        });

        await profileList.save();
        console.log("User registered successfully");
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error("An error occurred during registration:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'signIn.html'));
});

// Sign-in route
app.post('/signin', async (req, res) => {
    try {
        const { signInEmail, signInPassword } = req.body;

        if (!signInEmail || !signInPassword) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await loginDetails.findOne({ emailID: signInEmail });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(signInPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        req.login(user, (err) => {
            if (err) {
                console.error("Login error:", err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.redirect('/profile');
        });
    } catch (err) {
        console.error("An error occurred during login:", err);
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

