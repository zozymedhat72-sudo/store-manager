import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast-item" [class]="'toast-item ' + t.type">
          <i [class]="t.type === 'success' ? 'bi bi-check-circle-fill' : t.type === 'error' ? 'bi bi-x-circle-fill' : 'bi bi-info-circle-fill'"></i>
          <span>{{ t.text }}</span>
          <button type="button" (click)="toast.dismiss(t.id)" aria-label="Close"><i class="bi bi-x"></i></button>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  protected toast = inject(ToastService);
}
