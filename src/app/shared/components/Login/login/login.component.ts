import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  LoginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
  });
  SubmitForm(): void {
    if (this.LoginForm.valid) {
      this.authService.sendLoginForm(this.LoginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          localStorage.setItem('PlayerToken', res.token);
          if (res.user.role == 'customer') {
            this.router.navigate(['/MyBookings']);
            this.toastService.success(res.message, 'Ehgazly');
          }
          else {
            this.router.navigate(['/CourtOwner']);
            this.toastService.success(res.message, 'Ehgazly');
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }
}
