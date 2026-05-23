export interface IcourtSpecficCourt {
    id: number
    maincourt_id: number
    name: string
    description: string
    type: string
    surface_type: string
    price_per_hour: string
    status: string
    is_open: boolean
    images: any[]
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
