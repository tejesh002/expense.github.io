import { roundMoney } from '../utils/settlement'
import { useExpenseStore } from '../hooks/useExpenseStore'

export function SummaryPanel() {
  const {
    participants,
    expenses,
    balances,
    pairwiseMatrix,
    transfers,
  } = useExpenseStore()

  if (participants.length === 0) {
    return null
  }

  return (
    <section className="panel summary-panel">
      <h2>Final summary</h2>
      <p className="lead">
        Updates automatically whenever you add or remove an expense.
      </p>

      <h3>Net balance</h3>
      <p className="muted small">
        Positive = should receive money back; negative = owes money overall.
      </p>
      <ul className="balance-list">
        {participants.map((p) => {
          const b = balances[p] ?? 0
          const sign = b > 0 ? '+' : ''
          return (
            <li key={p}>
              <strong>{p}</strong>
              <span className={b >= 0 ? 'pos' : 'neg'}>
                {sign}
                {formatMoney(b)}
              </span>
            </li>
          )
        })}
      </ul>

      <h3>Who pays whom (simplified)</h3>
      <p className="muted small">
        Fewest transfers that settle everyone given the net balances above.
      </p>
      {transfers.length === 0 ? (
        <p className="muted">
          {expenses.length === 0
            ? 'Add expenses to see settlement.'
            : 'Everyone is settled up.'}
        </p>
      ) : (
        <ul className="transfer-list">
          {transfers.map((t, i) => (
            <li key={`${t.from}-${t.to}-${i}`}>
              <span className="from">{t.from}</span>
              <span className="arrow">pays</span>
              <span className="to">{t.to}</span>
              <span className="amt">{formatMoney(t.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      <h3>Pairwise matrix</h3>
      <p className="muted small">
        Cell <em>row → column</em>: how much the row person pays the column
        person from direct splits (before netting).
      </p>
      {expenses.length === 0 ? (
        <p className="muted">No data yet.</p>
      ) : (
        <div className="matrix-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th></th>
                {participants.map((p) => (
                  <th key={p} scope="col">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((row, i) => (
                <tr key={row}>
                  <th scope="row">{row}</th>
                  {participants.map((_, j) => (
                    <td key={j}>
                      {i === j
                        ? '—'
                        : pairwiseMatrix[i]?.[j]
                          ? formatMoney(pairwiseMatrix[i][j])
                          : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundMoney(n))
}
