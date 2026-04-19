import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastAlertComponent } from '../../../shared/components/toast-alert/toast-alert/toast-alert.component';
@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) { }
  success(message: string, title: string = 'Success') {
    this.show('success', message, title);
  }

  error(message: string, title: string = 'Error') {
    this.show('error', message, title);
  }

  warning(message: string, title: string = 'Warning') {
    this.show('warning', message, title);
  }
  private show(type: 'success' | 'error' | 'warning', message: string, title: string) {
    let icon = '';
    switch (type) {
      case 'success': icon = 'check_circle_outline'; break;
      case 'error': icon = 'report_gmailerrorred'; break;
      case 'warning': icon = 'warning_amber'; break;
    }

    this.snackBar.openFromComponent(ToastAlertComponent, {
      duration: 3500,
      data: { message, title, type, icon },
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['transparent-snack']
    });
  }
}