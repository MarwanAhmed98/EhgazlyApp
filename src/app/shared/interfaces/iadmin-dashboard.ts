export interface IAdminDashboard {
    total_users: number
    total_customers: number
    total_courtowners: number
    pending_owners: number
    total_maincourts: number
    verified_maincourts: number
    pending_maincourts: number
    total_bookings: number
    pending_bookings: number
    confirmed_bookings: number
    completed_bookings: number
    total_revenue: string
    total_app_earnings: string
    pending_owner_payments: number
    recent_pending_owners: any[]
    recent_bookings: RecentBooking[]
    unread_notifications_count: number
}

export interface RecentBooking {
    id: number
    total_price: string
    status: string
    receipt_image_url: string
    rejection_reason?: string
    created_at: string
    customer: Customer
    court: Court
    maincourt: Maincourt
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
