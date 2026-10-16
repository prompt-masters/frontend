import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HomePage from '@/pages/HomePage'

describe('HomePage', () => {
  it('renders the PromptArena heading', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', { name: /welcome to promptarena/i }),
    ).toBeInTheDocument()
  })
})
