export interface ICustomerTournaments {
    id: number
    maincourt_id: number
    court_id: number
    name: string
    description: string
    team_size: string
    max_teams: number
    current_teams: number
    confirmed_teams_count: number
    spots_left: number
    entry_fee: string
    start_date: string
    end_date: string
    status: string
    regulations: any
    important_note: string
    total_prize_pool: number
    created_at: string
    updated_at: string
    maincourt: Maincourt
    court: Court
    primary_image: PrimaryImage
    prizes: Prize[]
    schedule: any[]
    timeslots: any[]
}

export interface Maincourt {
    id: number
    name: string
    address: string
}

export interface Court {
    id: number
    name: string
    type: string
}

export interface PrimaryImage {
    id: number
    url: string
    is_primary: boolean
    created_at: string
}

export interface Prize {
    position: string
    title: string
    prize_money: string
}
