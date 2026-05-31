export interface IPayOpenMatch {
    match: Match
    total_price: number
    payment_methods: PaymentMethod[]
}

export interface Match {
    id: number
    name: string
    status: string
    required_players: number
    current_players: number
    court: Court
    timeslots: Timeslot[]
}

export interface Court {
    id: number
    name: string
    price_per_hour: string
}

export interface Timeslot {
    id: number
    date: string
    start_time: string
    end_time: string
}

export interface PaymentMethod {
    id: number
    type: string
    identifier: string
    is_active: boolean
}
