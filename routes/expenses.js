const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const path = require('path');
const authMiddleware = require('../middleware/auth');         

function getUserFromSession(req, res, next) {
  const userId = req.session.userId;
  if (userId) {
    User.findByPk(userId)
      .then(user => {
        if (user) {
          req.user = user;
          next();
        } else {
          res.status(401).json({ message: 'Unauthorized' });
        }
      })
      .catch(error => {
        res.status(500).json({ message: 'Internal server error', error: error.message });
      });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Serve add expense page
router.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/add_expense.html'));
});


// Handle add expense form submission
router.post('/add', async (req, res) => {
    const { title, amount, date } = req.body;
  
    try {
      const newExpense = await Expense.create({
        title,
        amount: parseFloat(amount), // Ensure amount is a float
        date,
      });
      res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add expense', error: error.message });
    }
  });

module.exports = router;
