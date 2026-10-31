import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../services/order.service';

import { RestaurantOrder, OrderStatus } from '../../models/order.model';
import { apiError } from '../../services/api-error';
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList implements OnInit {
  private service = inject(OrderService);
  orders = signal<RestaurantOrder[]>([]);
  error = signal('');
  loading = signal(false);
  busy = signal(false);
  ngOnInit() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.service.getAll().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(apiError(e));
        this.loading.set(false);
      },
    });
  }
  update(order: RestaurantOrder, status: OrderStatus) {
    this.busy.set(true);
    this.service.updateStatus(order.id, status).subscribe({
      next: () => {
        this.busy.set(false);
        this.load();
      },
      error: (e) => {
        this.error.set(apiError(e));
        this.busy.set(false);
      },
    });
  }
}
