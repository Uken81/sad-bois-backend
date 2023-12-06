export interface CustomerType {
  email: string;
  emailoffers: boolean;
  firstname: string;
  lastname: string;
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

export interface TotalCalculationDataType {
  cart: CartType;
  shippingData: ShippingType;
}

export interface OrderDataType extends TotalCalculationDataType {
  customer: CustomerType;
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
