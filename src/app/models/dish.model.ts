export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  categoryId: number;
  categoryName: string;
}
export type DishRequest = Omit<Dish, 'id' | 'categoryName'>;
