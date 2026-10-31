import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';

import { apiError } from '../../services/api-error';
@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id = Number(this.route.snapshot.paramMap.get('id')) || null;
  error = signal('');
  busy = signal(false);
  loading = signal(false);
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });
  ngOnInit() {
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
      next: () => this.router.navigate(['/categories']),
      error: (e) => {
        this.error.set(apiError(e));
        this.busy.set(false);
      },
    });
  }
}
