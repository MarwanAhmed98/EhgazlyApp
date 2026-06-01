import { CourtOwnerPaymnetComponent } from './shared/components/CourtOwnerPayment/court-owner-paymnet/court-owner-paymnet.component';
import { CourtOwnerSpecificCourtsComponent } from './shared/components/CourtOwnerSpecificCourts/court-owner-specific-courts/court-owner-specific-courts.component';
import { AdminComponent } from './shared/components/Admin/admin/admin.component';
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
import { CourtOwnerBillingComponent } from './shared/components/court-owner-billing/court-owner-billing.component';
import { PaymentInstructionsComponent } from './shared/components/PaymentInstructions/payment-instructions/payment-instructions.component';
import { ProfofPaymentComponent } from './shared/components/ProfofPayment/profof-payment/profof-payment.component';
import { AdminDashboardComponent } from './shared/components/AdminDashboard/admin-dashboard/admin-dashboard.component';
import { UserDirectoryAdminComponent } from './shared/components/UserDirectoryAdmin/user-directory-admin/user-directory-admin.component';
import { AdminHubComponent } from './shared/components/AdminHub/admin-hub/admin-hub.component';
import { AdminJoinReqComponent } from './shared/components/AdminJoinReq/admin-join-req/admin-join-req.component';
import { JoinReqComponent } from './shared/components/JoinReq/join-req/join-req.component';
import { AdminReviewAppComponent } from './shared/components/AdminReviewApp/admin-review-app/admin-review-app.component';
import { AdminRevenuesComponent } from './shared/components/AdminRevenues/admin-revenues/admin-revenues.component';
import { AdminPendingListComponent } from './shared/components/AdminPendingList/admin-pending-list/admin-pending-list.component';
import { AdminUserManagementDashboardComponent } from './shared/components/AdminUserManagementDashboard/admin-user-management-dashboard/admin-user-management-dashboard.component';
import { AdminManageCourtsComponent } from './shared/components/AdminManageCourts/admin-manage-courts/admin-manage-courts.component';
import { AdminManageTournamentsComponent } from './shared/components/AdminManageTournaments/admin-manage-tournaments/admin-manage-tournaments.component';
import { AdminTournamentSetupFormComponent } from './shared/components/AdminTournamentSetupForm/admin-tournament-setup-form/admin-tournament-setup-form.component';
import { CustomerProfileComponent } from './shared/components/CustomerProfile/customer-profile/customer-profile.component';
import { PlayerNotificationComponent } from './shared/components/PlayerNotification/player-notification/player-notification.component';
import { CourtOwnerSpecificCourtComponent } from './shared/components/CourtOwnerSpecificCourt/court-owner-specific-court/court-owner-specific-court.component';
import { CourtOwnerCourtsComponent } from './shared/components/CourtOwnerCourts/court-owner-courts/court-owner-courts.component';
import { CourtOwnerWorkingHoursComponent } from './shared/components/CourtOwnerWorkingHours/court-owner-working-hours/court-owner-working-hours.component';
import { OpenMatchPaymentComponent } from './shared/components/OpenMatchPayment/open-match-payment/open-match-payment.component';
import { AdminSpecificCourtComponent } from './shared/components/AdminSpecificCourt/admin-specific-court/admin-specific-court.component';
import { AdminSpecTournamentComponent } from './shared/components/AdminSpecTournament/admin-spec-tournament/admin-spec-tournament.component';
import { AdminManageTourTeamsComponent } from './shared/components/AdminManageTourTeams/admin-manage-tour-teams/admin-manage-tour-teams.component';

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
        path: 'BookingandSchedule/:id',
        component: BookingandScheduleComponent,
        title: 'Booking and Schedule',
    },
    {
        path: 'payment/:selectedCourtId/:selectedSlotsId/:selectedDateISO/:grandTotal/:courtName/:MainCourtId',
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
        path: 'FriendlyMatchesDetails/:id',
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
        path: 'TournamentsDetails/:id',
        component: TournamentsDetailsComponent,
        title: 'Tournaments Details',
    },
    {
        path: 'TournamentsRegister/:id',
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
        path: 'CustomerProfile',
        component: CustomerProfileComponent,
        title: 'My Profile',
    },
    {
        path: 'CustomerProfile',
        component: CustomerProfileComponent,
        title: 'My Profile',
    },
    {
        path: 'OpenMatchPayment/:id',
        component: OpenMatchPaymentComponent,
        title: 'Open Match Payment',
    },
    {
        path: 'PlayerNotifications',
        component: PlayerNotificationComponent,
        title: 'Notifications',
    },
    {
        path: 'CourtOwner',
        component: CourtOwnerComponent,
        children: [
            { path: 'Dashboard', component: CourtOwnerDashboardComponent, title: 'Dashboard' },
            { path: 'CourtOwnerBookings', component: CourtOwnerBookingComponent, title: 'Bookings Management' },
            { path: 'CourtOwnerBookingsVerification/:id', component: CourtOwnerVerifciationComponent, title: 'Bookings Verification' },
            { path: 'CourtOwnerEarnings', component: CourtOwnerEarningsComponent, title: 'Earnings' },
            { path: 'CourtOwnerHistoricalBookings', component: CourtOwnerHistoricalBookingComponent, title: 'Historical Bookings' },
            { path: 'CourtOwnerManagement', component: CourtOwnerManagementComponent, title: 'Courts Management' },
            { path: 'CourtOwnerCourts', component: CourtOwnerCourtsComponent, title: 'Courts ' },
            { path: 'CourtOwnerSpecific/:mainCourtId/:id', component: CourtOwnerSpecificCourtsComponent, title: 'Specific Court' },
            { path: 'SpecificCourtOwner/:id', component: CourtOwnerSpecificCourtComponent, title: 'Specific Court' },
            { path: 'ManageCourtSchedule', component: ManageCourtScheduleComponent, title: 'Manage Court Schedule' },
            { path: 'CourtEditor/:id', component: CourtEditorComponent, title: 'Courts Editor' },
            { path: 'AddNewCourt', component: AddNewCourtComponent, title: 'Add New Court' },
            { path: 'Notifications', component: CourtOwnerNotificationsComponent, title: 'Notifications' },
            { path: 'Financials', component: CourtOwnerFinanceComponent, title: 'Financials' },
            { path: 'Billing&Payments', component: CourtOwnerBillingComponent, title: 'Billing & Payments' },
            { path: 'PaymentInstructions', component: PaymentInstructionsComponent, title: 'Payment Instructions' },
            { path: 'ProfilePayment', component: ProfofPaymentComponent, title: 'Profile Payment' },
            { path: 'ProfileWorkingHours', component: CourtOwnerWorkingHoursComponent, title: 'Profile Working Hours' },
            { path: 'CourtOwnerPaymnet', component: CourtOwnerPaymnetComponent, title: 'CourtOwner Paymnet ' },
            { path: '', redirectTo: 'Dashboard', pathMatch: 'full' }
        ]
    },
    {
        path: 'Admin',
        component: AdminComponent,
        children: [
            { path: 'AdminDashboard', component: AdminDashboardComponent, title: 'Dashboard' },
            { path: 'UserDirectory', component: UserDirectoryAdminComponent, title: 'User Directory' },
            { path: 'AdminHub', component: AdminHubComponent, title: 'Admin Hub' },
            { path: 'AdminJoinReq', component: AdminJoinReqComponent, title: 'Financials' },
            { path: 'ManageCourts', component: JoinReqComponent, title: 'Manage Courts' },
            { path: 'AdminReviewApp', component: AdminReviewAppComponent, title: 'Admin Review App' },
            { path: 'AdminRevenues', component: AdminRevenuesComponent, title: 'Admin Revenues' },
            { path: 'AdminPendingList', component: AdminPendingListComponent, title: 'Admin Pending List' },
            { path: 'AdminUserManagement', component: AdminUserManagementDashboardComponent, title: 'Admin User Management' },
            { path: 'AdminManageCourts', component: AdminManageCourtsComponent, title: 'Admin Manage Courts' },
            { path: 'AdminSpecificCourt/:id', component: AdminSpecificCourtComponent, title: 'Admin Specific Court' },
            { path: 'AdminManageTournaments', component: AdminManageTournamentsComponent, title: 'Admin Manage Tournaments' },
            { path: 'AdminSpecTournament/:id', component: AdminSpecTournamentComponent, title: 'Admin Specific Tournament' },
            { path: 'AdminManageTourTeams/:id', component: AdminManageTourTeamsComponent, title: 'Admin Manage Tournament Teams' },
            { path: 'AdminTournamentSetupForm', component: AdminTournamentSetupFormComponent, title: 'Admin Tournament Setup Form' },
            { path: '', redirectTo: 'UserDirectory', pathMatch: 'full' }
        ]
    },
];