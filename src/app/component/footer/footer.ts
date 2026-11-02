import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAME } from '../../core/config';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
})
export class FooterComponent {
  protected appName = APP_NAME;
  protected year = new Date().getFullYear();
}
