export interface ICourtOwnerFinancialData {
    commission_percentage: string
    total_revenue: string
    app_due_amount: string
    remaining_balance: string
    total_paid: number
    pending_payments: number
    payment_history: PaymentHistory[]
}

export interface PaymentHistory {
    id: number
    amount: string
    payment_type: string
    status: string
    rejection_reason: any
    created_at: string
}
