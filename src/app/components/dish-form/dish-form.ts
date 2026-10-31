import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { DishService } from '../../services/dish.service';

import { Category } from '../../models/category.model';

import { apiError } from '../../services/api-error';
@Component({
  selector: 'app-dish-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dish-form.html',
  styleUrl: './dish-form.css',
})
export class DishForm implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DishService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  categories = signal<Category[]>([]);
  id = Number(this.route.snapshot.paramMap.get('id')) || null;
  error = signal('');
  busy = signal(false);
  loading = signal(false);
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    price: [
      0.01,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(9999999999.99),
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
      ],
    ],
    available: [true],
    categoryId: [0, [Validators.required, Validators.min(1)]],
  });
  ngOnInit() {
    this.categoryService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: (e) => this.error.set(apiError(e)),
    });
    if (this.id) {
      this.loading.set(true);
      this.service.getById(this.id).subscribe({
        next: (data) => {
          this.form.patchValue(data);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(apiError(e));
          this.loading.set(false);
          this.form.disable();
        },
      });
    }
  }
  submit() {
    if (this.form.invalid || this.form.disabled || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const value = this.form.getRawValue();
    const request = this.id ? this.service.update(this.id, value) : this.service.create(value);
    request.subscribe({
      next: () => this.router.navigate(['/dishes']),
      error: (e) => {
        this.error.set(apiError(e));
        this.busy.set(false);
      },
    });
  }
}
