export interface IAdminManageOwnerPayments {
    id: number
    owner_id: number
    amount: string
    payment_type: string
    receipt_image_url: string
    notes: string
    status: string
    rejection_reason: any
    created_at: string
    owner: Owner
}

export interface Owner {
    id: number
    name: string
    email: string
    app_due_amount: string
}
