import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import HostGameForm from '@/features/game/HostGameForm'

describe('HostGameForm', () => {
  it('submits the selected game configuration', async () => {
    const onStart = vi.fn().mockResolvedValue(undefined)

    render(<HostGameForm onStart={onStart} />)

    fireEvent.change(screen.getByLabelText(/rounds/i), {
      target: { value: '7' },
    })

    fireEvent.change(screen.getByLabelText(/time per round/i), {
      target: { value: '90' },
    })

    fireEvent.change(screen.getByLabelText(/difficulty/i), {
      target: { value: 'hard' },
    })

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'coding' },
    })

    fireEvent.click(screen.getByRole('button', { name: /start lobby/i }))

    expect(onStart).toHaveBeenCalledWith({
      rounds: 7,
      timePerRound: 90,
      difficulty: 'hard',
      category: 'coding',
      aiModel: 'default',
    })
  })
})
