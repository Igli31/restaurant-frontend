import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { OrderService } from '../../services/order.service';

import { RestaurantOrder, OrderStatus } from '../../models/order.model';
import { apiError } from '../../services/api-error';
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList implements OnInit {
  private service = inject(OrderService);
  readonly statuses: OrderStatus[] = ['PLACED', 'PREPARING', 'SERVED', 'CANCELLED'];
  selectedStatus = signal<OrderStatus | ''>('');
  orders = signal<RestaurantOrder[]>([]);
  error = signal('');
  loading = signal(false);
  busy = signal(false);
  ngOnInit() {
    this.load();
  }
  changeStatus(status: OrderStatus | '') {
    this.selectedStatus.set(status);
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.service.getAll(this.selectedStatus() || undefined).subscribe({
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
