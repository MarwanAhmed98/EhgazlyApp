import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/Home/home/home.component';
import { LoginComponent } from './shared/components/Login/login/login.component';
import { SignupComponent } from './shared/components/signup/signup/signup.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'Home', pathMatch: 'full'
    },
    {
        path: 'Home',
        component: HomeComponent,
        title: 'Home',
    },
    {
        path: 'Login',
        component: LoginComponent,
        title: 'Login',
    },
    {
        path: 'SignUP',
        component: SignupComponent,
        title: 'Sign Up',
    },
];
