const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const path = require('path');
const User = require('../models/user');

// Serve registration page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html'));
});

// Handle registration form submission
router.post('/register', async (req, res) => {
    console.log('Registering user with data:', req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('username, email and password are required');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashedPassword });
        res.redirect('/auth/login');
    } catch (err) {
        res.send('Error: ' + err.message);
    }
});

// Serve login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Handle login form submission
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request received:', req.body);

    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).send('Username and password are required');
    }

    try {
        const user = await User.findOne({ where: { username } });
        console.log('User found:', user);

        if (!user) {
            console.log('User not found');
            return res.status(401).send('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(401).send('Invalid username or password');
        }

        req.session.user = user;
        console.log('User session:', req.session.user);
        res.redirect('/');
    } catch (err) {
        console.log('Error:', err.message);
        res.status(500).send('Error: ' + err.message);
    }
});



// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
