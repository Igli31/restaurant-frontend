import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DishService } from '../../services/dish.service';
import { OrderService } from '../../services/order.service';

import { Dish } from '../../models/dish.model';

import { apiError } from '../../services/api-error';
@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-form.html',
  styleUrl: './order-form.css',
})
export class OrderForm implements OnInit {
  private fb = inject(FormBuilder);
  private dishesService = inject(DishService);
  private ordersService = inject(OrderService);
  private router = inject(Router);
  dishes = signal<Dish[]>([]);
  error = signal('');
  busy = signal(false);
  loading = signal(true);
  form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(100)]],
    tableNumber: [
      1,
      [Validators.required, Validators.min(1), Validators.max(1000), Validators.pattern(/^\d+$/)],
    ],
    items: this.fb.array([this.line()]),
  });
  get items() {
    return this.form.controls.items;
  }
  line() {
    return this.fb.nonNullable.group({
      dishId: [0, [Validators.required, Validators.min(1)]],
      quantity: [
        1,
        [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern(/^\d+$/)],
      ],
    });
  }
  ngOnInit() {
    this.dishesService.getAll().subscribe({
      next: (data) => {
        this.dishes.set(data.filter((d) => d.available));
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(apiError(e));
        this.loading.set(false);
      },
    });
  }
  add() {
    if (this.items.length < 50) this.items.push(this.line());
  }
  remove(index: number) {
    if (this.items.length > 1) this.items.removeAt(index);
  }
  submit() {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.ordersService.create(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (e) => {
        this.error.set(apiError(e));
        this.busy.set(false);
      },
    });
  }
}
