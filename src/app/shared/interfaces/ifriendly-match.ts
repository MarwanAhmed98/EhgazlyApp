export interface IfriendlyMatch {
    id: number
    name: string
    description: string
    status: string
    required_players: number
    current_players: number
    spots_left: number
    booking_id: any
    created_at: string
    court: Court
    timeslot: Timeslot
    creator: Creator
}

export interface Court {
    id: number
    name: string
    type: string
    price_per_hour: string
    maincourt: Maincourt
}

export interface Maincourt {
    id: number
    name: string
    address: string
    primary_image: PrimaryImage
}

export interface PrimaryImage {
    id: number
    url: string
    is_primary: boolean
    created_at: string
}

export interface Timeslot {
    id: number
    date: string
    start_time: string
    end_time: string
    status: string
}

export interface Creator {
    id: number
    name: string
}
