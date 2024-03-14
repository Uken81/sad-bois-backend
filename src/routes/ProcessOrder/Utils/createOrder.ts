import { OrderDataType, OrderType } from '../../../Types/checkoutTypes';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = (orderData: OrderDataType): OrderType => {
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

  const orderId = uuidv4();
  const customerId = orderData.customerId;
  const { email, country, firstName, lastName, address, apartment, suburb, state, postcode } =
    orderData.customerDetails;
  const shippingDetails = `Name: ${firstName} ${lastName}. Address: ${country} ${apartment}, ${address}, ${suburb}, ${state}, ${postcode}`;
  const { type } = orderData.shippingData;
  const orderedProducts = createOrderedProducts();
  const totalCost = orderData.orderTotalCost;
  const today = new Date();

  const order: OrderType = {
    orderId,
    customerId,
    customerEmail: email,
    shippingDetails,
    orderedProducts,
    dateOrdered: today,
    shippingType: type,
    totalCost
  };

  return order;
};
