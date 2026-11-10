import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RestaurantOrder } from '../../models/order.model';
import { OrderList } from './order-list';

describe('Filtering orders by status', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<OrderList>;
  const placedOrder: RestaurantOrder = {
    id: 1,
    customerName: 'Alex',
    tableNumber: 2,
    status: 'PLACED',
    createdAt: '2026-01-01T10:00:00Z',
    total: 12.5,
    items: [{ dishId: 7, dishName: 'Pizza', quantity: 1, unitPrice: 12.5, lineTotal: 12.5 }],
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [OrderList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OrderList);
    fixture.detectChanges();
    http.expectOne('/api/orders').flush([]);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  async function selectStatus(value: string) {
    const select = (fixture.nativeElement as HTMLElement).querySelector('select')!;
    select.value = value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function clickButton(label: string) {
    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((element) => element.textContent?.trim() === label)!;
    button.click();
    fixture.detectChanges();
  }

  it('starts with all statuses and offers the existing status values', () => {
    const select = (fixture.nativeElement as HTMLElement).querySelector('select')!;
    expect(select.value).toBe('');
    expect(Array.from(select.options).map((option) => option.value)).toEqual([
      '',
      'PLACED',
      'PREPARING',
      'SERVED',
      'CANCELLED',
    ]);
  });

  it('sends the selected status and removes the query parameter for all statuses', async () => {
    await selectStatus('PLACED');
    const request = http.expectOne('/api/orders?status=PLACED');
    expect(request.request.method).toBe('GET');
    request.flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No orders match the selected status.');

    await selectStatus('');
    http.expectOne('/api/orders').flush([placedOrder]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Alex');
    expect(fixture.nativeElement.textContent).not.toContain('No orders match');
  });

  it('keeps the filter when refreshing and blocks changes while loading', async () => {
    await selectStatus('SERVED');
    expect((fixture.nativeElement as HTMLElement).querySelector('select')!.disabled).toBe(true);
    http.expectOne('/api/orders?status=SERVED').flush([]);
    fixture.detectChanges();

    clickButton('Refresh');
    http.expectOne('/api/orders?status=SERVED').flush([]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('select')!.value).toBe('SERVED');
  });

  it('reloads the active filter after changing an order status', async () => {
    await selectStatus('PLACED');
    http.expectOne('/api/orders?status=PLACED').flush([placedOrder]);
    fixture.detectChanges();

    clickButton('Start preparing');
    const update = http.expectOne('/api/orders/1/status');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual({ status: 'PREPARING' });
    update.flush({ ...placedOrder, status: 'PREPARING' });
    http.expectOne('/api/orders?status=PLACED').flush([]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('article')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No orders match the selected status.');
  });

  it('shows a failed request and lets the user retry with the same filter', async () => {
    await selectStatus('PREPARING');
    http
      .expectOne('/api/orders?status=PREPARING')
      .flush(
        { detail: 'Order service is unavailable.' },
        { status: 503, statusText: 'Service Unavailable' },
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('Order service is unavailable.');
    expect(fixture.nativeElement.textContent).not.toContain('No orders match');
    expect((fixture.nativeElement as HTMLElement).querySelector('select')!.disabled).toBe(false);

    clickButton('Refresh');
    http.expectOne('/api/orders?status=PREPARING').flush([]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')).toBeNull();
  });
});
