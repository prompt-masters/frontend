import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/stores/authToken'

describe('auth token storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores and restores the access token', () => {
    setAccessToken('test-token')

    expect(getAccessToken()).toBe('test-token')
  })

  it('clears the access token on logout', () => {
    setAccessToken('test-token')
    clearAccessToken()

    expect(getAccessToken()).toBeNull()
  })
})
