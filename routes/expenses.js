const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const path = require('path');
const authMiddleware = require('../middleware/auth');         
const exp = require('constants');

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


// Handle add expense route
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

router.get('/edit', async(req, res) => {
  res.sendFile(path.join(__dirname, '../views/edit_expense.ejs'));
});
// route to handle the edit form that fetches data form the database and displays it
router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.render('edit_expense', { expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// route to handle teh update or the PUT request
router.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, date } = req.body;
  try {
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    expense.title = title;
    expense.amount = amount;
    expense.date = date;
    await expense.save();
    res.status(200).json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
