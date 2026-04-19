import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';

@Component({
  selector: 'app-forget-pass',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forget-pass.component.html',
  styleUrl: './forget-pass.component.scss'
})
export class ForgetPassComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  showSuccess = false;
  private successTimer: number | null = null;

  ForgetForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
  });

  SubmitForm(): void {
    if (this.ForgetForm.valid) {
      console.log(this.ForgetForm.value);
      this.authService.sendForgetPasswordForm(this.ForgetForm.value).subscribe({
        next: (res) => {
          console.log(res);
          this.openSuccess();
        },
        error: (error) => {
          console.error(error);
        },
      });
    } else {
      this.ForgetForm.markAllAsTouched();
    }
  }

  private openSuccess(): void {
    this.showSuccess = true;

    if (this.successTimer) window.clearTimeout(this.successTimer);
    this.successTimer = window.setTimeout(() => {
      this.showSuccess = false;
      this.successTimer = null;
    }, 5000);
  }

  closeSuccess(): void {
    this.showSuccess = false;
    if (this.successTimer) {
      window.clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  }

  backToLogin(): void {
    this.closeSuccess();
    this.router.navigate(['/Login']);
  }
}
