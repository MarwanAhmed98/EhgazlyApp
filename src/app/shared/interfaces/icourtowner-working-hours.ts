export interface ICourtownerWorkingHours {
    id: number
    maincourt_id: number
    day_of_week: string
    open_time: string
    close_time: string
    is_open: boolean
}
