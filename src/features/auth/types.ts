export type User = {
  id: string
  username: string
  email: string
  avatar_url: string | null
  elo_rating: number
  created_at: string
  email_verified?: boolean
  updated_at?: string
}

export type RegisterInput = {
  username: string
  email: string
  password: string
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterResponse = {
  data: User
}

export type LoginResponse = {
  data: {
    user: User
    token: string
  }
}

export type CurrentUserResponse = {
  data: User
}
