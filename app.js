const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const dotenv = require('dot-env');
const app = express();
const port= 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'iuytddcvsfd',
    resave: false,
    saveUninitialized: true
}));

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const expenseRouter = require('./routes/expenses');

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', expenseRouter);

sequelize.sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`App is running on http://localhost:${port}`)
        });
    });
