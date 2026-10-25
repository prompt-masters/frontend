export type HelperType = 'hint' | 'suggestion' | 'review'

export const HELPER_TYPES: HelperType[] = ['hint', 'suggestion', 'review']

export const HELPER_LABELS: Record<HelperType, string> = {
  hint: 'Hint',
  suggestion: 'Suggestion',
  review: 'Review',
}

export type HelperStatus = 'pending' | 'delivered' | 'refunded'

// A delivered helper, as POST /api/v1/rounds/{id}/helpers/{type} returns it.
export type HelperResult = {
  usage_id: string
  helper_type: HelperType
  cost: number
  content: string
  remaining_balance: number
}

export type HelperUsage = {
  usage_id: string
  helper_type: HelperType
  cost: number
  status: HelperStatus
  content: string | null
  error_code: string | null
  created_at: number
}

// GET /api/v1/rounds/{id}/helpers: the caller's balance, the prices and
// their own usage in the round.
export type HelperOverview = {
  balance: number
  prices: Record<HelperType, number>
  usage: HelperUsage[]
}

export type HelperInput = {
  // The player's current draft; a suggestion needs it, a review needs it or
  // a test.
  prompt?: string
  testId?: string
}
