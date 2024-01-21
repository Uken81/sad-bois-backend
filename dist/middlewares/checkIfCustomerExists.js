"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfCustomerExists = void 0;
const checkConnection_1 = require("../Utils/checkConnection");
const isResultEmpty_1 = require("../Utils/isResultEmpty");
const checkIfCustomerExists = async (req, res, next) => {
    var _a;
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const email = (_a = req.body.customer) === null || _a === void 0 ? void 0 : _a.email;
    if (!email) {
        console.error('Email value must be provided in customer check');
        return res.status(400).json({ error: 'Email required' });
    }
    const query = `SELECT CASE 
                WHEN EXISTS (
                    SELECT 1
                    FROM customers
                    WHERE email = ?
                ) THEN 'true'
                ELSE 'false'
            END as conditionMet;`;
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            return res.status(500).json({
                error: 'Database error occured',
                details: err.message,
                fatalError: err.fatal
            });
        }
        if ((0, isResultEmpty_1.isResultEmpty)(results)) {
            return res.status(404).json({
                error: 'Error finding matching customers'
            });
        }
        const row = results[0];
        req.isExistingCustomer = row.conditionMet;
        next();
    });
};
exports.checkIfCustomerExists = checkIfCustomerExists;
