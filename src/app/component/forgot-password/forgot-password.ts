import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/errors';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected step = signal<1 | 2 | 3>(1);
  protected loading = signal(false);
  protected error = signal('');

  protected emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected codeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]{4,8}$/)]],
  });

  protected passwordForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected sendCode(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.run(this.auth.forgotPassword(this.emailForm.getRawValue().email), () => {
      this.toast.success('We sent a code to your email');
      this.step.set(2);
    });
  }

  protected verify(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.run(this.auth.verifyResetCode(this.codeForm.getRawValue().code), () => this.step.set(3));
  }

  protected reset(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const email = this.emailForm.getRawValue().email;
    this.run(this.auth.resetPassword(email, this.passwordForm.getRawValue().password), () => {
      this.toast.success('Password updated, you can sign in now');
      this.router.navigate(['/login']);
    });
  }

  private run(request: ReturnType<AuthService['forgotPassword']>, done: () => void): void {
    this.error.set('');
    this.loading.set(true);
    request.subscribe({
      next: () => {
        this.loading.set(false);
        done();
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
