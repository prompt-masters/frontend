import { apiRequest } from '@/api/client'
import type {
  CurrentUserResponse,
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from '@/features/auth/types'

export function register(input: RegisterInput) {
  return apiRequest<RegisterResponse>('/api/v1/auth/register', {
    method: 'POST',
    authenticated: false,
    body: JSON.stringify(input),
  })
}

export function login(input: LoginInput) {
  return apiRequest<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    authenticated: false,
    body: JSON.stringify(input),
  })
}

export function getCurrentUser() {
  return apiRequest<CurrentUserResponse>('/api/v1/users/me')
}
