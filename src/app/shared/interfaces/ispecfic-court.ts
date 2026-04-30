export interface IspecficCourt {
    id: number
    name: string
    description: string
    address: string
    map_link: string
    latitude: string
    longitude: string
    images: Image[]
    amenities: Amenity[]
    working_hours: WorkingHour[]
    payment_methods: PaymentMethod[]
    courts: Court[]
}

export interface Image {
    id: number
    url: string
    is_primary: boolean
    created_at: string
}

export interface Amenity {
    id: number
    name: string
    icon?: string
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
    primary_image?: PrimaryImage
}

export interface PrimaryImage {
    id: number
    url: string
    is_primary: boolean
    created_at: string
}
