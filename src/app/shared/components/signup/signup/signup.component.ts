import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';


type Role = 'customer' | 'courtowner';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  role: Role = 'customer';
  showPassword = false;

  readonly RegisterForm = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\w{6,}$/)],
    }),
    rePassword: new FormControl<string>('', { nonNullable: true }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)],
    }),
    role: new FormControl<Role>('customer', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  setRole(role: Role): void {
    this.role = role;
    this.RegisterForm.controls.role.setValue(role);
    this.RegisterForm.controls.role.markAsDirty();
    this.RegisterForm.controls.role.markAsTouched();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  SubmitForm(): void {
    if (this.RegisterForm.valid) {
      this.authService.sendRegisterForm(this.RegisterForm.value).subscribe(
        {
          next: (res) => {
            console.log(res);
            localStorage.setItem('CourtOwnerToken', res.token);
            this.router.navigate(['/Login']);
          },
          error: (err) => {
            console.log(err);
          }
        }
      )
    }
    console.log(this.RegisterForm.value)
  }

  dismissRoleError(): void {
    this.RegisterForm.controls.role.markAsUntouched();
    this.RegisterForm.controls.role.markAsPristine();
    this.RegisterForm.controls.role.updateValueAndValidity({ emitEvent: false });
  }
}