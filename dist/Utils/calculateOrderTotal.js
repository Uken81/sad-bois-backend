"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrderTotal = void 0;
const calculateOrderTotal = async (data, connection) => {
    const { items } = data.cart;
    const { shippingPrice } = data.shippingData;
    let itemSubtotal = 0;
    for (const item of items) {
        const id = item.productId;
        const quantity = item.quantity;
        const query = 'SELECT * FROM products WHERE id = ?';
        try {
            const [productOrder] = await new Promise((resolve, reject) => {
                connection.query(query, [id], (err, results) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(results);
                    }
                });
            });
            if (!productOrder) {
                throw new Error('Product order not found');
            }
            const itemPrice = productOrder.price;
            console.log('itemPrice: ', itemPrice);
            itemSubtotal += itemPrice * quantity;
        }
        catch (error) {
            throw new Error(`Error calculating order total:  ${error}`);
        }
    }
    const orderTotal = itemSubtotal + shippingPrice;
    const formattedTotal = orderTotal.toFixed(2);
    return formattedTotal;
};
exports.calculateOrderTotal = calculateOrderTotal;
