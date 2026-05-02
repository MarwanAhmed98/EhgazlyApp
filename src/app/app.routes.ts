import { AddNewCourtComponent } from './shared/components/AddNewCourt/add-new-court/add-new-court.component';
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
import { FriendlyMatchOrganizerComponent } from './shared/components/FriendlyMatchOrganizer/friendly-match-organizer/friendly-match-organizer.component';
import { TournamentsComponent } from './shared/components/Tournaments/tournaments/tournaments.component';
import { TournamentsDetailsComponent } from './shared/components/TournamentsDetails/tournaments-details/tournaments-details.component';
import { TournamentsRegisterComponent } from './shared/components/TournamentsRegister/tournaments-register/tournaments-register.component';
import { TournamentsPaymentComponent } from './shared/components/TournamentsPayment/tournaments-payment/tournaments-payment.component';
import { TournamentsDashboardComponent } from './shared/components/TournamentsDashboard/tournaments-dashboard/tournaments-dashboard.component';
import { CourtOwnerComponent } from './shared/components/CourtOwner/court-owner/court-owner.component';
import { CourtOwnerDashboardComponent } from './shared/components/CourtOwnerDashboard/court-owner-dashboard/court-owner-dashboard.component';
import { CourtOwnerBookingComponent } from './shared/components/CourtOwnerBooking/court-owner-booking/court-owner-booking.component';
import { CourtOwnerVerifciationComponent } from './shared/components/CourtOwnerBookingVerficiation/court-owner-verifciation/court-owner-verifciation.component';
import { CourtOwnerEarningsComponent } from './shared/components/CourtOwnerEarnings/court-owner-earnings/court-owner-earnings.component';
import { CourtOwnerHistoricalBookingComponent } from './shared/components/CourtOwnerHistoricalBooking/court-owner-historical-booking/court-owner-historical-booking.component';
import { CourtOwnerManagementComponent } from './shared/components/CourtOwnerManagement/court-owner-management/court-owner-management.component';
import { CourtEditorComponent } from './shared/components/CourtEditor/court-editor/court-editor.component';
import { ManageCourtScheduleComponent } from './shared/components/ManageCourtSchedule/manage-court-schedule/manage-court-schedule.component';
import { CourtOwnerNotificationsComponent } from './shared/components/CourtOwnerNotifications/court-owner-notifications/court-owner-notifications.component';
import { CourtOwnerFinanceComponent } from './shared/components/CourtOwnerFinance/court-owner-finance/court-owner-finance.component';

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
        path: 'FullBookingDetails/:id',
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
        title: 'Courts',
    },
    {
        path: 'VenuesDetails/:id',
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
    {
        path: 'FriendlyMatchOrganizer',
        component: FriendlyMatchOrganizerComponent,
        title: 'Friendly Match Organizer',
    },
    {
        path: 'Tournaments',
        component: TournamentsComponent,
        title: 'Tournaments',
    },
    {
        path: 'TournamentsDetails',
        component: TournamentsDetailsComponent,
        title: 'Tournaments Details',
    },
    {
        path: 'TournamentsRegister',
        component: TournamentsRegisterComponent,
        title: 'Tournaments Register',
    },
    {
        path: 'TournamentsPayment',
        component: TournamentsPaymentComponent,
        title: 'Tournaments Payment',
    },
    {
        path: 'TournamentsDashboard',
        component: TournamentsDashboardComponent,
        title: 'My Tournaments Dashboard',
    },
    {
        path: 'CourtOwner',
        component: CourtOwnerComponent,
        children: [
            { path: 'Dashboard', component: CourtOwnerDashboardComponent, title: 'Dashboard' },
            { path: 'CourtOwnerBookings', component: CourtOwnerBookingComponent, title: 'Bookings Management' },
            { path: 'CourtOwnerBookingsVerification', component: CourtOwnerVerifciationComponent, title: 'Bookings Verification' },
            { path: 'CourtOwnerEarnings', component: CourtOwnerEarningsComponent, title: 'Earnings' },
            { path: 'CourtOwnerHistoricalBookings', component: CourtOwnerHistoricalBookingComponent, title: 'Historical Bookings' },
            { path: 'CourtOwnerManagement', component: CourtOwnerManagementComponent, title: 'Courts Management' },
            { path: 'ManageCourtSchedule', component: ManageCourtScheduleComponent, title: 'Manage Court Schedule' },
            { path: 'CourtEditor', component: CourtEditorComponent, title: 'Courts Editor' },
            { path: 'AddNewCourt', component: AddNewCourtComponent, title: 'Add New Court' },
            { path: 'Notifications', component: CourtOwnerNotificationsComponent, title: 'Notifications' },
            { path: 'Financials', component: CourtOwnerFinanceComponent, title: 'Financials' },
            { path: '', redirectTo: 'Dashboard', pathMatch: 'full' }
        ]
    },

];
