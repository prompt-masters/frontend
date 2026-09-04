import { type FormEvent, useState } from 'react'

type JoinGameFormProps = {
  onJoin?: (roomCode: string) => Promise<void>
}

function JoinGameForm({ onJoin }: JoinGameFormProps) {
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')

    if (!/^\d{6}$/.test(roomCode)) {
      setError('Room code must contain exactly 6 digits.')
      return
    }

    if (!onJoin) {
      setError('Joining a room will be available when PA-31 API is ready.')
      return
    }

    setIsSubmitting(true)

    try {
      await onJoin(roomCode)
    } catch {
      setError('Unable to join this room. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6"
    >
      <div>
        <h2 className="text-xl font-bold">Join Game</h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter the 6-digit code shared by the host.
        </p>
      </div>

      <div>
        <label htmlFor="roomCode" className="text-sm font-medium">
          Room code
        </label>

        <input
          id="roomCode"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          value={roomCode}
          onChange={(event) => {
            setRoomCode(event.target.value.replace(/\D/g, '').slice(0, 6))
            setError('')
          }}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-slate-400"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-800 bg-red-950 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-white px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Joining...' : 'Join Game'}
      </button>
    </form>
  )
}

export default JoinGameForm
