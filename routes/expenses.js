const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const path = require('path');

router.get('add', async (req, res) => {
    res.sendFile(path.join(__dirname, '../views/add_expense.html'));
});

router.post('/add', async (req, res) => {
    const { description, amount } = req.body;
    try {
        const expense = await Expense.create({ description, amount, userId: req.session.user.id });
        res.redirect('/expenses/view');
    } catch (err) {
        res.send('Error: ' + err.message);
    }
});

router.get('/edit/:id', async (req, res) => {
    const expense = await Expense.findByPk(req.params.id);
    res.sendFile(path.join(__dirname, '../views/edit_expense.html'));
});

router.post('/edit/:id', async (req, res) => {
    const { description, amount } = req.body;
    try {
        const expense = await Expense.findByPk(req.params.id);
        expense.description = description;
        expense.amount = amount;
        await expense.save();
        res.redirect('/expenses/view');
    } catch (err) {
        res.send('Error: ' + err.message);
    }
});

router.get('/view', async (req, res) => {
    const expenses = await Expense.findAll({ where: { userId: req.session.user.id } });
    res.sendFile(path.join(__dirname, '../views/view_expense.html'));
});

module.exports = router;
