import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-pass',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-pass.component.html',
  styleUrl: './reset-pass.component.scss'
})
export class ResetPassComponent {
  private readonly router = inject(Router);
  minPasswordLength = 6;

  showNewPassword = false;
  showConfirmPassword = false;

  ResetForm = new FormGroup(
    {
      newPassword: new FormControl<string | null>(null, [
        Validators.required,
        Validators.minLength(this.minPasswordLength),
      ]),
      confirmPassword: new FormControl<string | null>(null, [Validators.required]),
    },
    {
      validators: [this.passwordMatchValidator],
    }
  );

  SubmitForm(): void {
    if (this.ResetForm.valid) {
      console.log('Reset password:', { newPassword: this.ResetForm.value.newPassword });
      this.router.navigate(['/Login']);

    } else {
      this.ResetForm.markAllAsTouched();
    }
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) return null;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
}
