export interface ICourtOwnerMainCourt {
    id: number
    owner_id: number
    name: string
    description: string
    address: string
    map_link: string
    latitude: string
    longitude: string
    status: string
    is_verified: boolean
    created_at: string
    updated_at: string
    courts: Court[]
    amenities: any[]
    payment_methods: PaymentMethod[]
    working_hours: WorkingHour[]
    primary_image: any
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
    created_at: string
    updated_at: string
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

export interface WorkingHour {
    id: number
    maincourt_id: number
    day_of_week: string
    open_time: string
    close_time: string
    is_open: boolean
}
