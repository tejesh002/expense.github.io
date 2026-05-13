import { formatInr } from '../utils/formatInr'
import { useExpenseStore } from '../hooks/useExpenseStore'

export function ExpenseList() {
  const { expenses, removeExpense } = useExpenseStore()

  if (expenses.length === 0) {
    return (
      <section className="panel">
        <h2>Expenses</h2>
        <p className="muted">No expenses yet.</p>
      </section>
    )
  }

  const scrollable = expenses.length >= 10

  return (
    <section className="panel">
      <h2>Expenses</h2>
      <div
        className={
          scrollable ? 'table-wrap table-wrap--scrollable' : 'table-wrap'
        }
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Split between</th>
              <th>Paid by</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{formatInr(e.price)}</td>
                <td>{e.splitTo.join(', ')}</td>
                <td>{e.spendBy}</td>
                <td>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => removeExpense(e.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
