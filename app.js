const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sequelize = require('./config/database');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port= 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET || 'wertyuiouyt',
    resave: false,
    saveUninitialized: true
}));

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const expenseRouter = require('./routes/expenses');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/expenses', expenseRouter);

sequelize.sync({ force: false })
    .then(() => {
        app.listen(port, () => {
            console.log(`App is running on http://localhost:${port}`)
        });
    });