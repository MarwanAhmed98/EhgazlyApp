export interface Inearstcourt {
    id: number
    name: string
    description: string
    address: string
    map_link: string
    latitude: string
    longitude: string
    distance: number
    distance_text: string
    courts_count: number
    primary_image: PrimaryImage
    amenities: Amenity[]
    working_hours: WorkingHour[]
}

export interface PrimaryImage {
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
