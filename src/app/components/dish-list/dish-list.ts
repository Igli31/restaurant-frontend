import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DishService } from '../../services/dish.service';

import { Dish } from '../../models/dish.model';

import { apiError } from '../../services/api-error';
@Component({
  selector: 'app-dish-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dish-list.html',
  styleUrl: './dish-list.css',
})
export class DishList implements OnInit {
  private service = inject(DishService);
  records = signal<Dish[]>([]);
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
        this.records.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(apiError(e));
        this.loading.set(false);
      },
    });
  }
  remove(id: number) {
    if (!confirm('Delete this dish?')) return;
    this.busy.set(true);
    this.service.delete(id).subscribe({
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
