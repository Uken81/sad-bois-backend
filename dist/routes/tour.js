"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkConnection_1 = require("../Utils/checkConnection");
const attachConnection_1 = require("../middlewares/attachConnection");
const router = express_1.default.Router();
router.use(attachConnection_1.attachConnection);
router.get('/', (req, res) => {
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const query = 'SELECT * FROM tour ORDER BY date DESC;';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            res.status(500).json({
                error: 'Database error occured',
                details: err.message,
                fatalError: err.fatal
            });
        }
        res.status(200).json(results);
    });
});
router.get('/latest', (req, res) => {
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const query = 'SELECT * FROM tour ORDER BY date DESC LIMIT 4;';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            res.status(500).json({
                error: 'Database error occured',
                details: err.message,
                fatalError: err.fatal
            });
        }
        res.status(200).json(results);
    });
});
exports.default = router;
