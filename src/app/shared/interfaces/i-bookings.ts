export interface IBookings {
    id: number
    customer_id: number
    court_id: number
    timeslot_id: number
    payment_method_id: number
    total_price: string
    receipt_image_url: string
    status: string
    rejection_reason: any
    created_at: string
    updated_at: string
    court: Court
    timeslot: Timeslot
    payment_method: PaymentMethod2
}

export interface Court {
    id: number
    maincourt_id: number
    name: string
    description: string
    type: string
    surface_type: string
    price_per_hour: string
    status: string
    is_open: boolean
    maincourt: Maincourt
}

export interface Maincourt {
    id: number
    name: string
    address: string
    working_hours: WorkingHour[]
    payment_methods: PaymentMethod[]
}

export interface WorkingHour {
    id: number
    maincourt_id: number
    day_of_week: string
    open_time: string
    close_time: string
    is_open: boolean
}

export interface PaymentMethod {
    id: number
    maincourt_id: number
    type: string
    identifier: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Timeslot {
    id: number
    date: string
    start_time: string
    end_time: string
    status: string
}

export interface PaymentMethod2 {
    id: number
    maincourt_id: number
    type: string
    identifier: string
    is_active: boolean
    created_at: string
    updated_at: string
}
