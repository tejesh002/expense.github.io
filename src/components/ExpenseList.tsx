import { roundMoney } from '../utils/settlement'
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

  return (
    <section className="panel">
      <h2>Expenses</h2>
      <div className="table-wrap">
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
                <td>{formatMoney(e.price)}</td>
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

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundMoney(n))
}
