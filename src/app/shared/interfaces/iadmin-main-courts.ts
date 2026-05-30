export interface IAdminMainCourts {
    id: number
    owner_id: number
    name: string
    description: string
    address: string
    map_link: string
    latitude: string
    longitude: string
    status: string
    is_verified: boolean
    courts_count: number
    owner: Owner
    courts: any[]
}

export interface Owner {
    id: number
    name: string
    email: string
    phone: string
}
