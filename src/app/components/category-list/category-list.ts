import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CategoryService } from '../../services/category.service';

import { Category } from '../../models/category.model';

import { apiError } from '../../services/api-error';
@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  private service = inject(CategoryService);
  records = signal<Category[]>([]);
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
    if (!confirm('Delete this category?')) return;
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
