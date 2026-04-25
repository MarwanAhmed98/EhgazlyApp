import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';


@Component({
  selector: 'app-reset-pass',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-pass.component.html',
  styleUrl: './reset-pass.component.scss',
})
export class ResetPassComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  minPasswordLength = 6;

  showNewPassword = false;
  showConfirmPassword = false;

  ResetForm = new FormGroup(
    {
      email: new FormControl<string | null>(null, [Validators.required, Validators.email]),

      token: new FormControl<string | null>(null, [Validators.required]),

      password: new FormControl<string | null>(null, [
        Validators.required,
        Validators.minLength(this.minPasswordLength),
      ]),

      password_confirmation: new FormControl<string | null>(null, [Validators.required]),
    },
    { validators: [this.passwordMatchValidator] }
  );

  ngOnInit(): void {
    // Extract both token + email from URL using paramMap + queryParamMap
    const tokenFromParam = this.route.snapshot.paramMap.get('token');
    const emailFromParam = this.route.snapshot.paramMap.get('email');

    const tokenFromQuery = this.route.snapshot.queryParamMap.get('token');
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');

    const extractedToken = tokenFromParam ?? tokenFromQuery;
    const extractedEmail = emailFromParam ?? emailFromQuery;

    this.ResetForm.patchValue({
      email: extractedEmail,
      token: extractedToken,
    });
  }

  SubmitForm(): void {
    if (this.ResetForm.valid) {
      this.authService.sendResetPasswordForm(this.ResetForm.value).subscribe({
        next: (res) => {
          console.log(res);
          this.toastService.success(res.message, 'Ehgazly');
          this.router.navigate(['/Login']);
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      this.ResetForm.markAllAsTouched();
    }
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newpassword = control.get('password')?.value;
    const confirmpassword = control.get('password_confirmation')?.value;

    if (!newpassword || !confirmpassword) return null;

    return newpassword === confirmpassword ? null : { passwordMismatch: true };
  }
}