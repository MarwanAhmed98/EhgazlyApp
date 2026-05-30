export interface IAdminFinancials {
    commission_percentage: any
    total_revenue: string
    app_due_amount: string
    remaining_balance: string
    total_paid: string
    pending_payments: number
    payment_history: PaymentHistory[]
}

export interface PaymentHistory {
    id: number
    owner_id: number
    amount: string
    payment_type: string
    receipt_image_url: string
    notes: string
    status: string
    rejection_reason?: string
    created_at: string
    owner: Owner
}

export interface Owner {
    id: number
    name: string
    email: string
    app_due_amount: string
}
