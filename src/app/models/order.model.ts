export type OrderStatus = 'PLACED' | 'PREPARING' | 'SERVED' | 'CANCELLED';
export interface OrderItem {
  dishId: number;
  dishName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}
export interface RestaurantOrder {
  id: number;
  customerName: string;
  tableNumber: number;
  status: OrderStatus;
  createdAt: string;
  total: number;
  items: OrderItem[];
}
export interface OrderRequest {
  customerName: string;
  tableNumber: number;
  items: { dishId: number; quantity: number }[];
}
