export interface ITeamTournament {
    id: number
    tournament_id: number
    captain_id: number
    payment_type: string
    team_name: string
    team_color: string
    captain_name: string
    captain_phone: string
    receipt_image_url: string
    status: string
    rejection_reason: any
    created_at: string
    updated_at: string
    captain: Captain
}

export interface Captain {
    id: number
    user_id: number
    name: string
    email: string
    phone: string
}
