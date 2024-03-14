import { OrderType } from '../../../Types/checkoutTypes';
import { pool } from '../../../server';

export const insertOrder = async (customerOrder: OrderType) => {
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

  pool?.query(
    customerOrderQuery,
    [
      orderId,
      customerId,
      customerEmail,
      shippingDetails,
      orderedProducts,
      dateOrdered,
      shippingType,
      totalCost
    ],
    (err: Error | null) => {
      if (err) {
        console.error(err);
        throw new Error();
      }

      console.log(`New order added for ${customerEmail}`);
    }
  );
};
