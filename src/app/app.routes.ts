import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/Home/home/home.component';
import { LoginComponent } from './shared/components/Login/login/login.component';
import { SignupComponent } from './shared/components/signup/signup/signup.component';
import { PlayerbookingComponent } from './shared/components/playerbooking/playerbooking/playerbooking.component';
import { LoginnnnComponent } from './shared/components/loginnnn/loginnnn/loginnnn.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'Home', pathMatch: 'full'
    },
    {
        path: 'Home',
        component: HomeComponent,
        title: 'Home',
    },
    // {
    //     path: 'loginnn',
    //     component: LoginnnnComponent,
    //     title: 'Login',
    // },
    {
        path:'Login',
        component: LoginComponent,
        title: 'Login',
    },
    {
        path: 'SignUP',
        component: SignupComponent,
        title: 'Sign Up',
    },
     {
        path: 'MyBookings',
        component: PlayerbookingComponent,
        title: 'My Bookings',
    },
];
