import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
@Component({
  selector: 'app-toast-alert',
  imports: [CommonModule],
  templateUrl: './toast-alert.component.html',
  styleUrl: './toast-alert.component.scss'
})
export class ToastAlertComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}
