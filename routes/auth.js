const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');
const { where } = require('sequelize');
const { use } = require('.');

router.get('/register', (req, res) => {
    res.sendFile('register.html', { root: 'views'});
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await User.create({ username, password: hashedPassword});
        res.redirect('/auth/login');
    } catch (err) {
        res.send('Error: ' + err.message);
    }
});

router.get('/login', (req, res) => {
    res.sendFile('login.html', { root: 'views' });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.send('Invalid username or password');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;