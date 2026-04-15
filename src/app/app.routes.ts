import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/Home/home/home.component';
import { LoginComponent } from './shared/components/Login/login/login.component';
import { SignupComponent } from './shared/components/signup/signup/signup.component';
import { PlayerbookingComponent } from './shared/components/playerbooking/playerbooking/playerbooking.component';
import { PlayerFullBookingComponent } from './shared/components/PlayerFullBooking/player-full-booking/player-full-booking.component';
import { VenuesComponent } from './shared/components/Venues/venues/venues.component';
import { CourtDetailsComponent } from './shared/components/CourtDetails/court-details/court-details.component';

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
    {
        path: 'MyBookings',
        component: PlayerbookingComponent,
        title: 'My Bookings',
    },
    {
        path: 'FullBookingDetails',
        component: PlayerFullBookingComponent,
        title: 'Full Booking Details',
    },
    {
        path: 'Venues',
        component: VenuesComponent,
        title: 'Venues',
    },
    {
        path: 'VenuesDetails',
        component: CourtDetailsComponent,
        title: 'Court Details',
    },
];
