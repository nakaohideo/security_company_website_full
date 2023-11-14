const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const connectDB = require('./config/db');
const cors = require('cors')

const app = express();

connectDB();

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login'); // Redirect to the login page or any other desired page
    });
});

app.use('/api/users', require('./routes/api/users'))

const PORT = 5000;

app.listen(PORT, () => console.log(chalk.bgRed(`Server started on port ${PORT}`)));