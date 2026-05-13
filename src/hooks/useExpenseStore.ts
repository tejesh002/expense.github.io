import { useContext } from 'react'
import { ExpenseContext } from '../context/expenseContext'

export function useExpenseStore() {
  const ctx = useContext(ExpenseContext)
  if (!ctx) {
    throw new Error('useExpenseStore must be used within ExpenseProvider')
  }
  return ctx
}
