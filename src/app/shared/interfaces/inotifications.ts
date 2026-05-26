export interface INotifications {
    notifications: Notification[]
    unread_count: number
}

export interface Notification {
    id: number
    title: string
    message: string
    type: string
    is_read: boolean
    created_at: string
}
