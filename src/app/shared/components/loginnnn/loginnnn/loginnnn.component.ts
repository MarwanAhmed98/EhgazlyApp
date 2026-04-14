import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../../../core/services/Auth/auth.service';

@Component({
  selector: 'app-loginnnn',
 imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './loginnnn.component.html',
  styleUrl: './loginnnn.component.scss'
})
export class LoginnnnComponent {
  private readonly authService = inject(AuthService);
  LoginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.pattern(/^\w{6,}$/)]),
  });
  SubmitForm():void{
    if(this.LoginForm.valid){
      this.authService.sendLoginForm(this.LoginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          // localStorage.setItem('token', res.token);
          // this.router.navigate(['/MyBookings']);
          console.log(this.LoginForm.value);
        },
        error: (error) => {
          console.error(error);
        }
      });
  }
    
    }
}
