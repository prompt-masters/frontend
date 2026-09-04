import { API_BASE_URL } from '@/api/config'
import { clearAccessToken, getAccessToken } from '@/stores/authToken'

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { authenticated = true, ...requestOptions } = options

  const headers = new Headers(requestOptions.headers)

  if (!headers.has('Content-Type') && requestOptions.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (authenticated) {
    const token = getAccessToken()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...requestOptions,
    headers,
  })

  let data: unknown = null

  if (response.status !== 204) {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      data = await response.json()
    }
  }

  if (response.status === 401) {
    clearAccessToken()

    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed with status ${response.status}`,
      data,
    )
  }

  return data as T
}
