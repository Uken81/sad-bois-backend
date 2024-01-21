"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attachConnection_1 = require("../middlewares/attachConnection");
const checkConnection_1 = require("../Utils/checkConnection");
const isResultEmpty_1 = require("../Utils/isResultEmpty");
const router = express_1.default.Router();
router.use(attachConnection_1.attachConnection);
router.get('/', (req, res) => {
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const email = req.query.email;
    const query = 'SELECT * FROM shop_orders WHERE customerEmail = ? ORDER BY dateOrdered DESC';
    connection.query(query, [email], (err, results) => {
        console.log('ordersresults', results);
        if (err) {
            console.error('Error executing query: ', err);
            res.status(500).json({
                error: 'Database error occured',
                details: err.message,
                fatalError: err.fatal
            });
        }
        if ((0, isResultEmpty_1.isResultEmpty)(results)) {
            console.log('Current user has no product orders');
            return res.status(200).json({ message: 'User has not made any orders yet.' });
        }
        res.status(200).json(results);
    });
});
exports.default = router;
