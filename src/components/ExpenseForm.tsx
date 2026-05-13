import { useMemo, useState } from 'react'
import { useExpenseStore } from '../hooks/useExpenseStore'

export function ExpenseForm() {
  const { participants, addExpense } = useExpenseStore()
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [spendBy, setSpendBy] = useState('')
  const [splitSelection, setSplitSelection] = useState<Record<string, boolean>>(
    {},
  )

  const splitTo = useMemo(
    () => participants.filter((p) => splitSelection[p]),
    [participants, splitSelection],
  )

  function toggleSplit(name: string) {
    setSplitSelection((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const allSelected =
    participants.length > 0 &&
    participants.every((p) => splitSelection[p])

  function toggleSelectAll() {
    if (allSelected) {
      setSplitSelection({})
    } else {
      setSplitSelection(Object.fromEntries(participants.map((p) => [p, true])))
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number.parseFloat(price)
    if (
      !title.trim() ||
      Number.isNaN(amount) ||
      amount <= 0 ||
      !spendBy ||
      splitTo.length === 0
    ) {
      return
    }
    addExpense({
      title: title.trim(),
      price: amount,
      splitTo,
      spendBy,
    })
    setTitle('')
    setPrice('')
    setSpendBy('')
    setSplitSelection({})
  }

  const canSubmit =
    participants.length > 0 &&
    title.trim() &&
    Number.parseFloat(price) > 0 &&
    spendBy &&
    splitTo.length > 0

  if (participants.length === 0) {
    return (
      <section className="panel muted-panel">
        <h2>Add expense</h2>
        <p className="muted">Add at least one participant first.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <h2>Add expense</h2>
      <form className="expense-form" onSubmit={submit}>
        <label className="field">
          <span>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dinner, taxi…"
            required
          />
        </label>
        <label className="field">
          <span>Price</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </label>
        <label className="field">
          <span>Paid by</span>
          <select
            value={spendBy}
            onChange={(e) => setSpendBy(e.target.value)}
            required
          >
            <option value="">Select…</option>
            {participants.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="split-fieldset">
          <legend>Split between</legend>
          <div className="split-grid">
            <label className="check-label">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
              All
            </label>
            {participants.map((p) => (
              <label key={p} className="check-label">
                <input
                  type="checkbox"
                  checked={!!splitSelection[p]}
                  onChange={() => toggleSplit(p)}
                />
                {p}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={!canSubmit}>
          Add expense
        </button>
      </form>
    </section>
  )
}
