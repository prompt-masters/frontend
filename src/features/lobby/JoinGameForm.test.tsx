import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import JoinGameForm from '@/features/lobby/JoinGameForm'

describe('JoinGameForm', () => {
  it('shows an error for an invalid room code', () => {
    render(<JoinGameForm />)

    fireEvent.change(screen.getByLabelText(/room code/i), {
      target: { value: '123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /join game/i }))

    expect(
      screen.getByText(/room code must contain exactly 6 digits/i),
    ).toBeInTheDocument()
  })

  it('submits a valid 6-digit room code', async () => {
    const onJoin = vi.fn().mockResolvedValue(undefined)

    render(<JoinGameForm onJoin={onJoin} />)

    fireEvent.change(screen.getByLabelText(/room code/i), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /join game/i }))

    expect(onJoin).toHaveBeenCalledWith('123456')
  })
})
