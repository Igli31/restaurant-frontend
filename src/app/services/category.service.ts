import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, CategoryRequest } from '../models/category.model';
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private url = '/api/categories';
  getAll() {
    return this.http.get<Category[]>(this.url);
  }
  getById(id: number) {
    return this.http.get<Category>(this.url + '/' + id);
  }
  create(value: CategoryRequest) {
    return this.http.post<Category>(this.url, value);
  }
  update(id: number, value: CategoryRequest) {
    return this.http.put<Category>(this.url + '/' + id, value);
  }
  delete(id: number) {
    return this.http.delete<void>(this.url + '/' + id);
  }
}
