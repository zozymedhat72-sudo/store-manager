import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './component/footer/footer';
import { Navbar } from './component/navbar/navbar';
import { ToastContainer } from './shared/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, FooterComponent, ToastContainer],
  templateUrl: './app.html',
})
export class App {}
