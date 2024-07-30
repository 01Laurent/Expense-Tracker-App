const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.get('/add_expense', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/add_expense.html'));
});

router.get('/edit_expense', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/edit_expense.html'));
});

router.get('/view_expense', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/view_expense.html'));
});

module.exports = router;