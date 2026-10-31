import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Dish, DishRequest } from '../models/dish.model';
@Injectable({ providedIn: 'root' })
export class DishService {
  private http = inject(HttpClient);
  private url = '/api/dishes';
  getAll() {
    return this.http.get<Dish[]>(this.url);
  }
  getById(id: number) {
    return this.http.get<Dish>(this.url + '/' + id);
  }
  create(value: DishRequest) {
    return this.http.post<Dish>(this.url, value);
  }
  update(id: number, value: DishRequest) {
    return this.http.put<Dish>(this.url + '/' + id, value);
  }
  delete(id: number) {
    return this.http.delete<void>(this.url + '/' + id);
  }
}
