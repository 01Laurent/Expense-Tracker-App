const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./config/database');
const path = require('path');
const dotenv = require('dotenv');
const router = express.Router();
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

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

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const expenseRoute = require('./routes/expenses');
const User = require('./models/user');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/expenses', expenseRoute);

sequelize.sync({ force: false })
    .then(() => {
        app.listen(port, () => {
            console.log(`App is running on http://localhost:${port}`);
        });
    });
    
