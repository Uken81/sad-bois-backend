"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkConnection_1 = require("../Utils/checkConnection");
const attachConnection_1 = require("../middlewares/attachConnection");
const isResultEmpty_1 = require("../Utils/isResultEmpty");
const router = express_1.default.Router();
router.use(attachConnection_1.attachConnection);
router.get('/', (req, res) => {
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const query = 'SELECT * FROM products';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            res.status(500).json({
                error: 'Database error occured',
                details: err.message,
                fatalError: err.fatal
            });
        }
        if ((0, isResultEmpty_1.isResultEmpty)(results)) {
            console.error('Error: failed to find products');
            return res.status(500).json({ error: 'Products not found' });
        }
        res.status(200).json(results);
    });
});
router.get('/featured', (req, res) => {
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const query = 'SELECT * FROM products WHERE isFeatured = 1';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            res.status(500).json({
                error: 'Database error occured',
                details: err.message,
                fatalError: err.fatal
            });
        }
        if ((0, isResultEmpty_1.isResultEmpty)(results)) {
            console.error('Error: failed to find featured products');
            return res.status(500).json({ error: 'Featured products not found' });
        }
        res.status(200).json(results);
    });
});
router.get('/byId', (req, res) => {
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const id = req.query.id;
    console.log('id**: ', id);
    const query = 'SELECT * FROM products WHERE id = ? LIMIT 1';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            res.status(500).json({
                error: 'Database error occured',
                details: err.message,
                fatalError: err.fatal
            });
        }
        if ((0, isResultEmpty_1.isResultEmpty)(results)) {
            console.error('Error: failed to find selected product');
            return res.status(500).json({ error: 'No product with that id found' });
        }
        res.status(200).json(results[0]);
    });
});
exports.default = router;
