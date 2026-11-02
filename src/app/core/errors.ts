import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(err: unknown, fallback = 'Something went wrong, please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Check your connection.';
    return err.error?.message || err.error?.errors?.msg || fallback;
  }
  return fallback;
}
