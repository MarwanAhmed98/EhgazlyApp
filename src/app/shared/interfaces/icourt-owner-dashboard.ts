export interface ICourtOwnerDashboard {
    total_maincourts: number
    total_courts: number
    total_bookings: number
    pending_bookings: number
    confirmed_bookings: number
    completed_bookings: number
    rejected_bookings: number
    total_revenue: string
    app_due_amount: string
    remaining_balance: string
    recent_bookings: RecentBooking[]
    unread_notifications_count: number
}

export interface RecentBooking {
    id: number
    total_price: string
    status: string
    receipt_image_url: string
    rejection_reason: any
    created_at: string
    customer: Customer
    court: Court
    maincourt: Maincourt
    timeslot: Timeslot
}

export interface Customer {
    id: number
    name: string
    phone: string
    email: string
}

export interface Court {
    id: number
    name: string
    type: string
}

export interface Maincourt {
    id: number
    name: string
}

export interface Timeslot {
    id: number
    date: string
    start_time: string
    end_time: string
}
