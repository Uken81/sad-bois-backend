import { CartType, ShippingType } from '../../Types/checkoutTypes';
import { pool } from '../../server';
import { QueryResult, QueryResultRow } from 'pg';

export const calculateOrderTotal = async (cart: CartType, shippingData: ShippingType) => {
  try {
    const { items } = cart;
    const { shippingPrice } = shippingData;

    const productIds = items.map((item) => item.productId);
    const query = 'SELECT * FROM products WHERE id = ANY($1::int[])';
    const productsData: QueryResultRow[] = await new Promise((resolve, reject) => {
      pool?.query(query, [productIds], (err: Error, results: QueryResult) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.rows);
        }
      });
    });

    if (!productsData) {
      throw new Error('Error querying the database for product ids');
    }

    const itemsSubtotal = items.reduce((acc, item) => {
      const product = productsData.find((prod) => prod.id == item.productId);
      if (!product) {
        throw new Error(`Could not find matching product for id of ${item.productId}`);
      }

      const price = Number(product?.price);
      return acc + price * item.quantity;
    }, 0);

    if (!itemsSubtotal || isNaN(itemsSubtotal)) {
      throw new Error('Subtotal calculation result is undefined or not a number type');
    }

    const orderTotal = itemsSubtotal + shippingPrice;
    const formattedTotal = orderTotal.toFixed(2);

    return formattedTotal;
  } catch (error) {
    throw new Error(`Error calculating order total: ${error}`);
  }
};
