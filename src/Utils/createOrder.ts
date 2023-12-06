import { OrderDataType, OrderType } from '../Types/checkoutTypes';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = (orderData: OrderDataType, orderTotal: string): OrderType => {
  const { email, country, firstname, lastname, address, apartment, suburb, state, postcode } =
    orderData.customer;
  const { type } = orderData.shippingData;
  const shippingDetails = `Name: ${firstname} ${lastname}. Address: ${country} ${apartment}, ${address}, ${suburb}, ${state}, ${postcode}`;

  const createOrderedProducts = () => {
    const cartItems = orderData.cart.items;
    const newList = cartItems.map((item) => ({
      id: item.productId.toString(),
      size: item.size ?? 'N/A',
      quantity: item.quantity.toString()
    }));
    const stringifiedList = JSON.stringify(newList);
    return stringifiedList;
  };
  const orderedProducts = createOrderedProducts();
  const orderId = uuidv4();
  const today = new Date();

  const order: OrderType = {
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
