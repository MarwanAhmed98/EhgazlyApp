// export interface ICourtOwnerBookings {
//     id: number
//     total_price: string
//     status: string
//     receipt_image_url: string
//     rejection_reason: any
//     created_at: string
//     customer: Customer
//     court: Court
//     maincourt: Maincourt
//     timeslot: Timeslot
//     payment_method: PaymentMethod
// }

// export interface Customer {
//     id: number
//     name: string
//     phone: string
//     email: string
// }

// export interface Court {
//     id: number
//     name: string
//     type: string
// }

// export interface Maincourt {
//     id: number
//     name: string
// }

// export interface Timeslot {
//     id: number
//     date: string
//     start_time: string
//     end_time: string
// }

// export interface PaymentMethod {
//     id: number
//     type: string
//     identifier: string
// }
export interface ICourtOwnerBookings {
    id: number
    total_price: string
    status: string
    receipt_image_url: string
    rejection_reason: any
    created_at: string
    customer: Customer
    court: Court
    maincourt: Maincourt
    timeslots: Timeslot[]
    payment_method: PaymentMethod
}

export interface Customer {
    id: number
    name: string
    phone: string
    email: string
}

export interface Court {
    id: number
    name: string
    type: string
}

export interface Maincourt {
    id: number
    name: string
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
}
