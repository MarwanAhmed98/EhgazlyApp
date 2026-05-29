export interface IAdminManageOwners {
    id: number
    user: User
    commission_percentage: string
    total_revenue: string
    app_due_amount: string
    remaining_balance: string
    ownership_proof_url: string
    maincourts_count: number
    maincourts: Maincourt[]
}

export interface User {
    id: number
    name: string
    email: string
    phone: string
    status: string
}

export interface Maincourt {
    id: number
    name: string
    status: string
    is_verified: boolean
    courts_count: any
}
