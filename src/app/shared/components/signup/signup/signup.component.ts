import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/Auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { LoginNavbarComponent } from "../../../../layouts/LoginNavbar/login-navbar/login-navbar.component";

type Role = 'customer' | 'courtowner';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, LoginNavbarComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  role: Role = 'customer';
  showPassword = false;

  ownershipProofPreviewUrl: string | null = null;
  ownershipProofError: string | null = null;

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
    // NOTE: control exists, but required is dynamic (only for OWNER)
    ownership_proof_url: new FormControl<File | null>(null),
  });

  setRole(role: Role): void {
    this.role = role;
    this.RegisterForm.controls.role.setValue(role);
    this.RegisterForm.controls.role.markAsDirty();
    this.RegisterForm.controls.role.markAsTouched();

    this.applyOwnerProofValidators();
  }

  private applyOwnerProofValidators(): void {
    const ctrl = this.RegisterForm.controls.ownership_proof_url;

    if (this.role === 'courtowner') {
      ctrl.setValidators([Validators.required]);
      ctrl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    // not owner: clear everything + hide field
    ctrl.clearValidators();
    ctrl.setValue(null);
    ctrl.markAsPristine();
    ctrl.markAsUntouched();
    ctrl.updateValueAndValidity({ emitEvent: false });

    this.ownershipProofError = null;
    this.clearOwnershipPreview();
  }

  onOwnershipProofSelected(event: Event): void {
    this.ownershipProofError = null;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.RegisterForm.controls.ownership_proof_url.setValue(null);
      this.clearOwnershipPreview();
      return;
    }

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.ownershipProofError = 'Only image files are allowed (png, jpg, jpeg, webp).';
      this.RegisterForm.controls.ownership_proof_url.setValue(null);
      this.RegisterForm.controls.ownership_proof_url.markAsTouched();
      this.clearOwnershipPreview();
      input.value = '';
      return;
    }

    this.RegisterForm.controls.ownership_proof_url.setValue(file);
    this.RegisterForm.controls.ownership_proof_url.markAsDirty();
    this.RegisterForm.controls.ownership_proof_url.markAsTouched();
    this.RegisterForm.controls.ownership_proof_url.updateValueAndValidity({ emitEvent: false });

    this.setOwnershipPreview(file);
  }

  private setOwnershipPreview(file: File): void {
    this.clearOwnershipPreview();
    this.ownershipProofPreviewUrl = URL.createObjectURL(file);
  }

  private clearOwnershipPreview(): void {
    if (this.ownershipProofPreviewUrl) {
      URL.revokeObjectURL(this.ownershipProofPreviewUrl);
    }
    this.ownershipProofPreviewUrl = null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  SubmitForm(): void {
    if (this.RegisterForm.invalid) return;

    const fd = new FormData();
    fd.append('name', this.RegisterForm.controls.name.value);
    fd.append('email', this.RegisterForm.controls.email.value);
    fd.append('password', this.RegisterForm.controls.password.value);
    fd.append('rePassword', this.RegisterForm.controls.rePassword.value ?? '');
    fd.append('phone', this.RegisterForm.controls.phone.value);
    fd.append('role', this.RegisterForm.controls.role.value);

    const proof = this.RegisterForm.controls.ownership_proof_url.value;
    if (this.role === 'courtowner') {
      if (!proof) return; // required by your UI rule
      fd.append('ownership_proof_url', proof); // file
    }

    this.authService.sendRegisterForm(fd).subscribe({
      next: (res) => {
        localStorage.setItem('CourtOwnerToken', res.token);
        this.toastService.success(res.message, 'Ehgazly');
        this.router.navigate(['/Login']);
      },
      error: (err) => console.log(err),
    });
  }

  dismissRoleError(): void {
    this.RegisterForm.controls.role.markAsUntouched();
    this.RegisterForm.controls.role.markAsPristine();
    this.RegisterForm.controls.role.updateValueAndValidity({ emitEvent: false });
  }
}