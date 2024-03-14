import { OrderType } from '../../../Types/checkoutTypes';
import { pool } from '../../../server';

export const insertOrder = async (customerOrder: OrderType) => {
  if (!customerOrder) {
    throw new Error('Error creating new order');
  }

  try {
    const {
      orderId,
      customerId,
      customerEmail,
      shippingDetails,
      orderedProducts,
      dateOrdered,
      shippingType,
      totalCost
    } = customerOrder;

    const customerOrderQuery =
      'INSERT INTO orders (order_id, customer_id, customer_email, shipping_Details, ordered_products, date_ordered, shipping_type, total_cost) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';

    await pool?.query(customerOrderQuery, [
      orderId,
      customerId,
      customerEmail,
      shippingDetails,
      orderedProducts,
      dateOrdered,
      shippingType,
      totalCost
    ]);

    console.log(`New order added for ${customerId}`);
  } catch (error) {
    throw new Error(`Error inserting order ${customerOrder.customerId}: ${error}`);
  }
};
