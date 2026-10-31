import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestaurantOrder, OrderRequest, OrderStatus } from '../models/order.model';
@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private url = '/api/orders';
  getAll() {
    return this.http.get<RestaurantOrder[]>(this.url);
  }
  getById(id: number) {
    return this.http.get<RestaurantOrder>(this.url + '/' + id);
  }
  create(value: OrderRequest) {
    return this.http.post<RestaurantOrder>(this.url, value);
  }
  updateStatus(id: number, status: OrderStatus) {
    return this.http.patch<RestaurantOrder>(this.url + '/' + id + '/status', { status });
  }
}
