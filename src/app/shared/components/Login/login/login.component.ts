import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
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
          }
          else {
            this.router.navigate(['/Venues']);
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }
}
