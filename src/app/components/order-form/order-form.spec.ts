import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { OrderForm } from './order-form';

describe('Placing an order', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrderForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function setup() {
    const fixture = TestBed.createComponent(OrderForm);
    fixture.detectChanges();
    http.expectOne('/api/dishes').flush([
      { id: 1, name: 'Pizza', price: 12.5, available: true, categoryId: 1, categoryName: 'Mains' },
      { id: 2, name: 'Soup', price: 6, available: false, categoryId: 1, categoryName: 'Mains' },
    ]);
    fixture.detectChanges();
    return fixture;
  }
  it('only offers available dishes', () => {
    const fixture = setup();
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Pizza');
    expect(text).not.toContain('Soup');
  });
  it('rejects fractional quantities before sending an order', () => {
    const fixture = setup();
    fixture.componentInstance.form.patchValue({
      customerName: 'Alex',
      tableNumber: 1,
      items: [{ dishId: 1, quantity: 1.5 }],
    });
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.form.invalid).toBe(true);
    http.expectNone('/api/orders');
  });
  it('sends dish IDs and quantities and displays an unavailable-service error', () => {
    const fixture = setup();
    fixture.componentInstance.form.patchValue({
      customerName: 'Alex',
      tableNumber: 2,
      items: [{ dishId: 1, quantity: 2 }],
    });
    fixture.componentInstance.submit();
    const request = http.expectOne('/api/orders');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      customerName: 'Alex',
      tableNumber: 2,
      items: [{ dishId: 1, quantity: 2 }],
    });
    request.flush(
      { detail: 'Menu service is unavailable.' },
      { status: 503, statusText: 'Unavailable' },
    );
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('Menu service is unavailable.');
    expect(fixture.componentInstance.busy()).toBe(false);
  });
});
