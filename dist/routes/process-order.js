"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attachConnection_1 = require("../middlewares/attachConnection");
const validateCardDetails_1 = require("../Utils/CardValidation/validateCardDetails");
const checkConnection_1 = require("../Utils/checkConnection");
const calculateOrderTotal_1 = require("../Utils/calculateOrderTotal");
const createOrder_1 = require("../Utils/createOrder");
const checkIfCustomerExists_1 = require("../middlewares/checkIfCustomerExists");
const router = express_1.default.Router();
router.use(attachConnection_1.attachConnection);
router.post('/', checkIfCustomerExists_1.checkIfCustomerExists, async (req, res) => {
    const connection = (0, checkConnection_1.checkConnection)(req.dbConnection);
    const cardDetails = req.body.formValues;
    const customer = req.body.customer;
    const cart = req.body.cart;
    const shippingData = req.body.selectedShipping;
    if (!cardDetails || !customer || !cart || !shippingData) {
        return res
            .status(400)
            .json({ error: 'Invalid request', message: 'Required data missing in request' });
    }
    let isCardValid = false;
    const validationResults = (0, validateCardDetails_1.validateCardDetails)(cardDetails);
    if (!validationResults.success) {
        return res
            .status(403)
            .json({ type: validationResults.type, message: validationResults.message });
    }
    else {
        isCardValid = true;
    }
    if (!isCardValid) {
        return res.status(400).json({ message: 'Invalid payment details' });
    }
    const { email, emailoffers, country, firstname, lastname, address, apartment, suburb, state, postcode } = customer;
    const customerQuery = 'INSERT INTO customers (email, emailoffers, country, firstname, lastname, address, apartment, suburb, state, postcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const isExistingCustomer = req.isExistingCustomer;
    if (isExistingCustomer === undefined) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error checking for existing customer'
        });
    }
    if (!isExistingCustomer) {
        connection.query(customerQuery, [
            email,
            emailoffers,
            country,
            firstname,
            lastname,
            address,
            apartment,
            suburb,
            state,
            postcode
        ], async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Database error occured',
                    type: 'network',
                    details: err.message,
                    fatalError: err.fatal
                });
            }
            console.log(`New customer ${email} added`);
        });
    }
    const totalCalculationData = {
        cart,
        shippingData
    };
    const orderTotal = await (0, calculateOrderTotal_1.calculateOrderTotal)(totalCalculationData, connection);
    const orderData = {
        customer,
        cart,
        shippingData
    };
    const customerOrder = (0, createOrder_1.createOrder)(orderData, orderTotal);
    console.log('orderTotal with shipping', orderTotal);
    console.log('customerOrder', customerOrder);
    const { orderId, customerEmail, shippingDetails, orderedProducts, dateOrdered, shippingType, totalCost } = customerOrder;
    const customerOrderQuery = 'INSERT INTO shop_orders (orderId, customerEmail, shippingDetails, orderedProducts, dateOrdered, shippingType, totalCost) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(customerOrderQuery, [
        orderId,
        customerEmail,
        shippingDetails,
        orderedProducts,
        dateOrdered,
        shippingType,
        totalCost
    ], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Database error occured',
                type: 'network',
                details: err.message,
                fatalError: err.fatal
            });
        }
        console.log(`New order added for ${customerEmail}`);
    });
    return res
        .status(200)
        .json({ message: 'Order processed successfully', orderSummary: customerOrder });
});
exports.default = router;
