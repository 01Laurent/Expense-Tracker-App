const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./config/database');
const { Expense, User } = require('./models')
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

const sessionStore = new SequelizeStore({
    db: sequelize,
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
    },
}));

sessionStore.sync();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/admindash', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admindash.html'));
});
app.get('/dashboard', (req, res) => {
    if (!req.session.user){
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/admin/dashboard', async (req, res) => {
    try {
        // Fetch data from the database
        const users = await User.findAll({
            include: [{ model: Expense, attributes: ['id', 'title', 'amount', 'date'] }]
        });

        const expenses = await Expense.findAll({
            include: [{ model: User, attributes: ['username', 'email'] }]
        });

        // Send the HTML file
        res.sendFile(path.join(__dirname, 'views', 'adminDash.html')); // Ensure correct path
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to provide the dashboard data as JSON
app.get('/admin/dashboard/data', async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: Expense, attributes: ['id', 'title', 'amount', 'date'] }]
        });

        const expenses = await Expense.findAll({
            include: [{ model: User, attributes: ['username', 'email'] }]
        });

        // Send the data as JSON
        res.json({ users, expenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json(req.session.user);
});

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });
        req.session.user = newUser;
        res.redirect('/dashboard');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;  // Now using 'username' instead of 'email'
    try {
        const user = await User.findOne({ where: { username } });  // Querying by 'username'
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });  // Error message updated
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });  // Error message updated
        }

        // Set session details
        req.session.user = {
            id: user.id,
            username: user.username,
            isAdmin: user.role === 'admin',  // Check if the user is an admin
        };

        // Redirect based on role
        if (user.role === 'admin') {
            return res.redirect('/admindash');  // Admin dashboard
        } else {
            return res.redirect('/dashboard');  // Normal user dashboard
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// app.post('/api/login', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const user = await User.findOne({ where: { username } });
//         if (!user) {
//             return res.status(400).json({ error: 'Invalid username or password' });
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ error: 'Invalid username or password' });
//         }
//         req.session.user = user;
//         res.redirect('/dashboard');
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.redirect('/');
    });
});

app.post('/api/add_expense', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { title, amount, date } = req.body;
    try {
        const newExpense = await Expense.create({ title, amount, date, userId: req.session.user.id });
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/expenses', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const expenses = await Expense.findAll({ where: { userId: req.session.user.id } });
        res.json(expenses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/expenses/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const { title, amount, date } = req.body;
    try {
        const expense = await Expense.findOne({ where: { id, userId: req.session.user.id } });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        expense.title = title;
        expense.amount = amount;
        expense.date = date;
        await expense.save();
        res.json(expense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/edit_expense', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, title, amount, date } = req.body;

    try {
        const expense = await Expense.findOne({
            where: { id, userId: req.session.user.id },
        });

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        expense.title = title;
        expense.amount = amount;
        expense.date = date;
        await expense.save();

        res.json({ success: true, expense });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/delete_expense', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id, password } = req.body;
    try {
        const user = await User.findOne({ where: { id: req.session.user.id } });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const expense = await Expense.findOne({ where: { id, userId: req.session.user.id } });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        await expense.destroy();
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/total_expenses', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const expenses = await Expense.findAll({ where: { userId: req.session.user.id } });
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        res.json(total);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, date } = req.body;

        const expense = await Expense.findByPk(id);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        expense.title = title;
        expense.amount = amount;
        expense.date = date;

        await expense.save();

        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

sequelize.sync({ force: false })
    .then(() => {
        app.listen(port, () => {
            console.log(`App is running on http://localhost:${port}`);
        });
    });
    
