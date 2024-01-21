"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const checkConnection_1 = require("../Utils/checkConnection");
const validateToken = async (req, res, next) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not correctly set in the environment variables');
    }
    const verifyToken = (token, secret) => {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
                if (err) {
                    console.error('Error verifying token', err);
                    reject(new Error(err.message));
                }
                if (!decoded) {
                    reject(new Error('Token is null or not decoded properly'));
                }
                resolve(decoded);
            });
        });
    };
    try {
        const decoded = await verifyToken(req.cookies.jwt, jwtSecret);
        console.log('decoded', decoded);
        const query = 'SELECT * FROM users WHERE email = ?';
        const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
        connection.query(query, [decoded.email], async (err, results) => {
            if (err) {
                console.error('Error querying the database:', err);
                res.status(500).json({ message: 'Server error', type: 'network' });
                return;
            }
            if (!results || results.length === 0) {
                console.error('No user found');
                return res.status(404).json('No user with that ID found');
            }
            if (results.length > 1) {
                return res.status(500).json('Multiple users with same id found');
            }
            req.isUserValidated = true;
            next();
        });
    }
    catch (error) {
        console.error('error', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.validateToken = validateToken;
