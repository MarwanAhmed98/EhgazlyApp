export interface Iplayerprofile {
    id: number
    name: string
    email: string
    phone: string
    profile_image: string
    can_book: boolean
    stats: Stats
}

export interface Stats {
    booking_count: number
    active_bookings_count: number
    completed_bookings_count: number
    cancelled_bookings_count: number
    rejected_bookings_count: number
}
