export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  errors: string[]
}

export type PageResponse<T> = {
  items: T[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}

export type Sport = {
  id: number
  name: string
  description: string | null
  status: "ACTIVE"
}

export type Venue = {
  id: number
  name: string
  address: string
  phone: string
  openingTime: string
  closingTime: string
  status: "ACTIVE"
  primaryImageUrl: string | null
}

export type Court = {
  id: number
  name: string
  pricePerHour: number
  status: "ACTIVE"
  sport: Pick<Sport, "id" | "name">
  venue: Pick<Venue, "id" | "name" | "address">
  primaryImageUrl: string | null
}

export type CourtFilters = {
  keyword?: string
  sportId?: number
  page?: number
  size?: number
}
