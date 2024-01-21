"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const checkConnection_1 = require("../Utils/checkConnection");
const attachConnection_1 = require("../middlewares/attachConnection");
const isResultEmpty_1 = require("../Utils/isResultEmpty");
const router = express_1.default.Router();
router.use(attachConnection_1.attachConnection);
router.post('/register', async (req, res) => {
    console.log('req', req.body);
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const { email, username, password, confirmedPassword } = req.body;
    if (!email || !username || !password || !confirmedPassword) {
        return res.status(400).json({ message: 'Missing form data' });
    }
    if (password !== confirmedPassword) {
        return res.status(400).json({
            message: 'Passwords do not match.',
            type: 'password'
        });
    }
    const duplicteQuery = 'SELECT email FROM users WHERE email = ?';
    connection.query(duplicteQuery, [email], async (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json({
                error: 'Database error occured',
                type: 'network',
                details: err.message,
                fatalError: err.fatal
            });
        }
        if (results.length > 0) {
            return res.status(400).json({
                message: 'Email already registered',
                type: 'duplicateEmail'
            });
        }
        const passwordHashed = await bcrypt_1.default.hash(password, 10);
        const query = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
        connection.query(query, [email, username, passwordHashed], (err, result) => {
            if (err) {
                console.error('Error querying the database:', err);
                return res.status(500).json({
                    error: 'Database error occured',
                    type: 'network',
                    details: err.message,
                    fatalError: err.fatal
                });
            }
            console.log('New user added. Insert ID:', result.insertId);
            return res.status(200).json({ message: 'Data inserted successfully' });
        });
    });
});
router.post('/login', async (req, res) => {
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const jwtSecret = process.env.JWT_SECRET;
    const cookieExpireTime = Number(process.env.JWT_COOKIE_EXPIRES);
    if (!jwtSecret) {
        console.error('JWT_SECRET is not correctly set in the environment variables');
        return res.status(500).json({
            message: 'Database error occured',
            type: 'network'
        });
    }
    if (isNaN(cookieExpireTime)) {
        console.error('JWT_COOKIE_EXPIRES is not set correctly in the environment variables');
        return res.status(500).json({
            message: 'Database error occured',
            type: 'network'
        });
    }
    const { email, password } = req.body;
    console.log('creds', email, password);
    const query = 'SELECT username, email, password FROM users WHERE email = ?';
    connection.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json({ message: 'Server error', type: 'network' });
        }
        if ((0, isResultEmpty_1.isResultEmpty)(results)) {
            return res.status(400).json({ message: 'Invalid email', type: 'email' });
        }
        console.log('results', results);
        const row = results[0];
        const user = {
            email: row.email,
            username: row.username,
            password: row.password
        };
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid password',
                type: 'password'
            });
        }
        if (passwordMatch) {
            const token = jsonwebtoken_1.default.sign({ email: user.email }, jwtSecret, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });
            const cookieOptions = {
                expires: new Date(Date.now() + cookieExpireTime * 24 * 60 * 60 * 1000),
                httpOnly: true
            };
            res.cookie('jwt', token, cookieOptions);
            return res.status(200).json({
                message: 'Login successful',
                user: { username: user.username, email: user.email }
            });
        }
    });
});
router.get('/validate', authMiddleware_1.validateToken, async (req, res) => {
    const isValidated = req.isUserValidated;
    if (!isValidated) {
        return res.status(401).json({ validationSuccess: false, message: 'Not authorized' });
    }
    return res.status(200).json({
        validationSuccess: true,
        message: 'Successfully validated user.'
    });
});
router.get('/logout', (req, res) => {
    try {
        res.cookie('jwt', 'logout', {
            expires: new Date(Date.now() + 2 * 1000),
            httpOnly: true
        });
        return res.status(200).json({ message: 'User logged out' });
    }
    catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).json({ message: 'Error logging out' });
    }
});
exports.default = router;
