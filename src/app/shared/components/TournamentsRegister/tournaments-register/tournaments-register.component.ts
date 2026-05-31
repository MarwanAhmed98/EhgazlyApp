import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { TournamentsService } from '../../../../core/services/Tournaments/tournaments.service';

@Component({
  selector: 'app-tournaments-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tournaments-register.component.html',
  styleUrl: './tournaments-register.component.scss'
})
export class TournamentsRegisterComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  tournamentId: number | null = null;
  receiptFile: File | null = null;
  receiptPreviewUrl: string | null = null;
  receiptError: string | null = null;

  RegisterForm = new FormGroup({
    teamName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)] }),
    teamColor: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    captainName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)] }),
    paymentType: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    receiptImage: new FormControl(null, { validators: [Validators.required] }) // virtual control
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.tournamentId = +id;
      } else {
        this.router.navigate(['/Tournaments']);
      }
    });
  }

  triggerFileInput(): void {
    document.getElementById('receiptInput')?.click();
  }

  onReceiptSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.receiptError = 'Only JPG, PNG, WEBP images are allowed.';
      this.receiptFile = null;
      this.receiptPreviewUrl = null;
      this.RegisterForm.controls.receiptImage.setErrors({ required: true });
      return;
    }

    this.receiptError = null;
    this.receiptFile = file;
    this.RegisterForm.controls.receiptImage.setErrors(null);

    const reader = new FileReader();
    reader.onload = (e) => this.receiptPreviewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  removeReceipt(): void {
    this.receiptFile = null;
    this.receiptPreviewUrl = null;
    this.receiptError = null;
    this.RegisterForm.controls.receiptImage.setErrors({ required: true });
    const fileInput = document.getElementById('receiptInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  SubmitForm(): void {
    if (this.RegisterForm.invalid || !this.receiptFile || !this.tournamentId) {
      this.toastService.error('Please fill all required fields and upload receipt.');
      return;
    }

    const formData = new FormData();
    formData.append('team_name', this.RegisterForm.value.teamName!);
    formData.append('team_color', this.RegisterForm.value.teamColor!);
    formData.append('captain_name', this.RegisterForm.value.captainName!);
    formData.append('captain_phone', this.RegisterForm.value.phone!);
    formData.append('payment_type', this.RegisterForm.value.paymentType!);
    formData.append('receipt_image', this.receiptFile);

    this.tournamentsService.RegisterTournaments(this.tournamentId, formData).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Registration successful!');
        this.router.navigate(['/Tournaments']); // adjust route as needed
      }
    });
  }
}