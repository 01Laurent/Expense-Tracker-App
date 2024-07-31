const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const path = require('path');
const authMiddleware = require('../middleware/auth');         

// Serve add expense page
router.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/add_expense.html'));
});

// Handle add expense form submission
router.post('/add', authMiddleware, async (req, res) => {
    console.log('Form data received:', req.body); // Log received form data

    const { title, amount, date } = req.body;

    if (!title || !amount || !date) {
        console.error('Missing required fields:', { title, amount, date });
        return res.status(400).send('Title, amount, and date are required');
    }

    try {
        await Expense.create({ title, amount, date, userId: req.session.user.id });
        res.redirect('/expenses/view');
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

router.get('/view', authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.session.user.id } });
        res.render('view_expense', { expenses });
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

// Serve edit expense page
router.get('/edit/:id', async (req, res) => {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
        return res.status(404).send('Expense not found');
    }

    res.render('edit_expense', { expense });
});

// Handle edit expense form submission
router.post('/edit/:id', async (req, res) => {
    const { title, amount, date } = req.body;

    if (!title || !amount || !date) {
        return res.status(400).send('Title, amount, and date are required');
    }

    try {
        const expense = await Expense.findByPk(req.params.id);

        if (!expense) {
            return res.status(404).send('Expense not found');
        }

        expense.title = title;
        expense.amount = amount;
        expense.date = date;
        await expense.save();

        res.redirect('/expenses/view');
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

// Serve view expenses page
router.get('/view', authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.session.user.id } });
        res.render('view_expense', { expenses });
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});


// Handle delete expense
router.post('/delete/:id', async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);

        if (!expense) {
            return res.status(404).send('Expense not found');
        }

        await expense.destroy();
        res.redirect('/expenses/view');
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

module.exports = router;
