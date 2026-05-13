import { useState } from 'react'
import { useExpenseStore } from '../hooks/useExpenseStore'

export function ParticipantsPanel() {
  const { participants, addParticipant, removeParticipant } = useExpenseStore()
  const [name, setName] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    addParticipant(name)
    setName('')
  }

  return (
    <section className="panel">
      <h2>Participants</h2>
      <form className="inline-form" onSubmit={submit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          aria-label="Participant name"
        />
        <button type="submit">Add</button>
      </form>
      {participants.length === 0 ? (
        <p className="muted">Add everyone who shares expenses.</p>
      ) : (
        <ul className="chip-list">
          {participants.map((p) => (
            <li key={p}>
              <span>{p}</span>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => removeParticipant(p)}
                aria-label={`Remove ${p}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
