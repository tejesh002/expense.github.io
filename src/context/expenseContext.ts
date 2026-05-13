import { createContext } from 'react'
import type { Expense, Transfer } from '../types'

export type ExpenseContextValue = {
  participants: string[]
  expenses: Expense[]
  balances: Record<string, number>
  pairwiseMatrix: number[][]
  transfers: Transfer[]
  addParticipant: (name: string) => void
  removeParticipant: (name: string) => void
  addExpense: (input: Omit<Expense, 'id'>) => void
  removeExpense: (id: string) => void
}

export const ExpenseContext = createContext<ExpenseContextValue | null>(null)
