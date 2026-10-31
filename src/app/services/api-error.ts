import { HttpErrorResponse } from '@angular/common/http';
export function apiError(error: HttpErrorResponse): string {
  return (
    error.error?.detail ||
    (error.status === 0
      ? 'Cannot reach the service. Check that both backends are running.'
      : 'The request failed. Please try again.')
  );
}
