const express = require('express');
const router = express.Router();
const { User, Expense } = require('../models');

// Admin Dashboard Route
router.get('/dashboard', async (req, res) => {
    try {
        // Fetch all users and their associated expenses
        const users = await User.findAll({
            include: [{
                model: Expense,
                attributes: ['id', 'title', 'amount', 'date']
            }]
        });

        const expenses = await Expense.findAll({
            include: [{
                model: User,
                attributes: ['username', 'email']
            }]
        });

        // Serve static HTML and inject data via a JSON response
        res.sendFile('path/to/adminDash.html', { root: __dirname }, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error loading admin dashboard');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to serve data as JSON
router.get('/dashboard/data', async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: Expense,
                attributes: ['id', 'title', 'amount', 'date']
            }]
        });

        const expenses = await Expense.findAll({
            include: [{
                model: User,
                attributes: ['username', 'email']
            }]
        });

        res.json({ users, expenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
