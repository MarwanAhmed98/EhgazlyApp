export interface ICourtOwnerSpecificCourt {
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
    payment_methods: any[]
    working_hours: any[]
    images: any[]
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
    primary_image: any
}
