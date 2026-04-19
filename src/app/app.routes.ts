import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/Home/home/home.component';
import { LoginComponent } from './shared/components/Login/login/login.component';
import { SignupComponent } from './shared/components/signup/signup/signup.component';
import { PlayerbookingComponent } from './shared/components/playerbooking/playerbooking/playerbooking.component';
import { PlayerFullBookingComponent } from './shared/components/PlayerFullBooking/player-full-booking/player-full-booking.component';
import { VenuesComponent } from './shared/components/Venues/venues/venues.component';
import { CourtDetailsComponent } from './shared/components/CourtDetails/court-details/court-details.component';
import { ForgetPassComponent } from './shared/components/ForgetPass/forget-pass/forget-pass.component';
import { ResetPassComponent } from './shared/components/ResetPass/reset-pass/reset-pass.component';
import { BookingandScheduleComponent } from './shared/components/BookingandSchedule/bookingand-schedule/bookingand-schedule.component';
import { PaymentComponent } from './shared/components/payment/payment/payment.component';
import { FriendlyMatchDashboardComponent } from './shared/components/FriendlyMatchDashboard/friendly-match-dashboard/friendly-match-dashboard.component';
import { FriendlyMatchDetailsComponent } from './shared/components/FriendlyMatchDetails/friendly-match-details/friendly-match-details.component';
import { CreateFriendlyMatchComponent } from './shared/components/CreateFriendlyMatch/create-friendly-match/create-friendly-match.component';

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
        path: 'ForgotPassword',
        component: ForgetPassComponent,
        title: 'Forgot Password',
    },
    {
        path: 'ResetPassword',
        component: ResetPassComponent,
        title: 'Reset Password',
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
        path: 'BookingandSchedule',
        component: BookingandScheduleComponent,
        title: 'Booking and Schedule',
    },
    {
        path: 'payment',
        component: PaymentComponent,
        title: 'Payment',
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
    {
        path: 'FriendlyMatches',
        component: FriendlyMatchDashboardComponent,
        title: 'Friendly Matches',
    },
    {
        path: 'FriendlyMatchesDetails',
        component: FriendlyMatchDetailsComponent,
        title: 'Friendly Matches Details',
    },
    {
        path: 'CreateFriendlyMatch',
        component: CreateFriendlyMatchComponent,
        title: 'Create Friendly Match',
    },
];
