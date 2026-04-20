import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';

@Component({
  selector: 'app-tournaments-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './tournaments-register.component.html',
  styleUrl: './tournaments-register.component.scss',
})
export class TournamentsRegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  role: 'customer' | 'courtowner' = 'customer';
  showPassword = false;

  readonly RegisterForm = new FormGroup({
    teamName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
    }),
    kitColor: new FormControl<string>('#2E7D32', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    captainName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
    }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)],
    }),
    role: new FormControl<'customer' | 'courtowner'>('customer', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  // exact swatches from provided image (green, blue, brown, red, black, white)
  kitColors = [
    { key: 'green', hex: '#146A1E' },
    { key: 'blue', hex: '#0B4FA1' },
    { key: 'brown', hex: '#A34700' },
    { key: 'red', hex: '#B42318' },
    { key: 'black', hex: '#1F1F1F' },
    { key: 'white', hex: '#FFFFFF' },
  ] as const;

  selectKitColor(hex: string): void {
    this.RegisterForm.controls.kitColor.setValue(hex);
    this.RegisterForm.controls.kitColor.markAsDirty();
    this.RegisterForm.controls.kitColor.markAsTouched();
  }

  setRole(role: 'customer' | 'courtowner'): void {
    this.role = role;
    this.RegisterForm.controls.role.setValue(role);
    this.RegisterForm.controls.role.markAsDirty();
    this.RegisterForm.controls.role.markAsTouched();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  SubmitForm(): void {
    // keep same submit flow structure as base code (no refactor)
    if (this.RegisterForm.valid) {
      this.router.navigate(['/TournamentsPayment']);
      // keeping service call structure (commented as in provided base code)
      // this.authService.sendRegisterForm(this.RegisterForm.value).subscribe({
      //   next: (res) => {
      //     console.log(res);
      //     localStorage.setItem('CourtOwnerToken', res.token);
      //     this.router.navigate(['/Login']);
      //   },
      //   error: (err) => {
      //     console.log(err);
      //   },
      // });
    }
    console.log(this.RegisterForm.value);
  }

  dismissRoleError(): void {
    this.RegisterForm.controls.role.markAsUntouched();
    this.RegisterForm.controls.role.markAsPristine();
    this.RegisterForm.controls.role.updateValueAndValidity({ emitEvent: false });
  }
}