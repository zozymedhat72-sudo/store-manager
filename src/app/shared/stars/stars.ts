import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-stars',
  template: `
    <span class="stars" [attr.aria-label]="rating() + ' out of 5'">
      @for (icon of icons(); track $index) {
        <i [class]="'bi ' + icon"></i>
      }
    </span>
  `,
})
export class Stars {
  rating = input(0);

  icons = computed(() => {
    const value = this.rating();
    return [1, 2, 3, 4, 5].map((n) =>
      value >= n ? 'bi-star-fill' : value >= n - 0.5 ? 'bi-star-half' : 'bi-star',
    );
  });
}
