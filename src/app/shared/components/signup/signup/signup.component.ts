import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';


type Role = 'player' | 'owner';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  role: Role = 'player';
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
    role: new FormControl<Role>('player', {
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
    this.RegisterForm.markAllAsTouched();
    if (this.RegisterForm.invalid) return;

    console.log(this.RegisterForm.getRawValue());
  }

  dismissRoleError(): void {
    this.RegisterForm.controls.role.markAsUntouched();
    this.RegisterForm.controls.role.markAsPristine();
    this.RegisterForm.controls.role.updateValueAndValidity({ emitEvent: false });
  }
}