import { ExpenseProvider } from './context/ExpenseProvider'
import { ParticipantsPanel } from './components/ParticipantsPanel'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import { SummaryPanel } from './components/SummaryPanel'
import './App.css'

function App() {
  return (
    <ExpenseProvider>
      <div className="app">
        <header className="app-header">
          <h1>Expense tracker</h1>
          <p className="tagline">
            Split bills evenly, see balances and who should pay whom.
          </p>
        </header>

        <main className="layout">
          <div className="col">
            <ParticipantsPanel />
            <ExpenseForm />
          </div>
          <div className="col">
            <ExpenseList />
            <SummaryPanel />
          </div>
        </main>
      </div>
    </ExpenseProvider>
  )
}

export default App
