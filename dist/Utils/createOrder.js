"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const uuid_1 = require("uuid");
const createOrder = (orderData, orderTotal) => {
    const { email, country, firstname, lastname, address, apartment, suburb, state, postcode } = orderData.customer;
    const { type } = orderData.shippingData;
    const shippingDetails = `Name: ${firstname} ${lastname}. Address: ${country} ${apartment}, ${address}, ${suburb}, ${state}, ${postcode}`;
    const createOrderedProducts = () => {
        const cartItems = orderData.cart.items;
        const newList = cartItems.map((item) => {
            var _a;
            return ({
                id: item.productId.toString(),
                size: (_a = item.size) !== null && _a !== void 0 ? _a : 'N/A',
                quantity: item.quantity.toString()
            });
        });
        const stringifiedList = JSON.stringify(newList);
        return stringifiedList;
    };
    const orderedProducts = createOrderedProducts();
    const orderId = (0, uuid_1.v4)();
    const today = new Date();
    const order = {
        orderId,
        customerEmail: email,
        shippingDetails,
        orderedProducts,
        dateOrdered: today,
        shippingType: type,
        totalCost: orderTotal
    };
    return order;
};
exports.createOrder = createOrder;
