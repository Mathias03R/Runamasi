export type Role = 'client' | 'worker'

export interface District {
  id: string
  name: string
}

export interface Service {
  id: string
  name: string
}

export interface ProfileSummary {
  name: string
}

export interface ReviewCount {
  count: number
}

export interface WorkerReview {
  id: string
  rating: number
  comment: string | null
  user_id: string | null
  created_at: string
}

export interface Worker {
  id: string
  user_id: string
  service_id: string
  district_id: string | null
  description: string | null
  phone: string | null
  rating?: number | null
  profiles?: ProfileSummary | null
  services?: Pick<Service, 'name'> | null
  districts?: Pick<District, 'name'> | null
  reviews?: ReviewCount[] | WorkerReview[] | null
}

export interface MatchResponse {
  detectedService?: string
  best?: Worker
  alternatives?: Worker[]
  total?: number
  message?: string
  error?: string
}

export interface SignUpFormData {
  email: string
  password: string
  name: string
  role: Role
  district: string
  serviceId?: string
  description?: string
  phone?: string
}
