export interface CustomerType {
  email: string;
  emailOffers: boolean;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  apartment: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface ShippingType {
  type: string;
  name: string;
  shippingPrice: number;
}

export interface ProductOrderType {
  productId: string;
  name: string;
  size?: string;
  price: number;
  quantity: number;
  cost: number;
}

export interface CartType {
  items: ProductOrderType[];
  subtotal: number;
}

export interface OrderDataType {
  cart: CartType;
  shippingData: ShippingType;
  customerDetails: CustomerType;
}

export interface CartSummaryTYpe {
  id: string;
  size: string;
  quantity: string;
}

export interface OrderType {
  orderId: string;
  customerEmail: string;
  shippingDetails: string;
  orderedProducts: string;
  dateOrdered: Date;
  shippingType: string;
  totalCost: string;
}
