import { useCallback, useMemo, useReducer, type ReactNode } from 'react'
import type { Expense } from '../types'
import {
  buildPairwiseOwedMatrix,
  computeBalances,
  roundMoney,
  simplifyToTransfers,
} from '../utils/settlement'
import { ExpenseContext, type ExpenseContextValue } from './expenseContext'

type State = {
  participants: string[]
  expenses: Expense[]
}

type Action =
  | { type: 'ADD_PARTICIPANT'; name: string }
  | { type: 'REMOVE_PARTICIPANT'; name: string }
  | { type: 'ADD_EXPENSE'; expense: Expense }
  | { type: 'REMOVE_EXPENSE'; id: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_PARTICIPANT': {
      const trimmed = action.name.trim()
      if (!trimmed || state.participants.includes(trimmed)) return state
      return { ...state, participants: [...state.participants, trimmed] }
    }
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter((p) => p !== action.name),
        expenses: state.expenses.filter(
          (e) =>
            e.spendBy !== action.name && !e.splitTo.includes(action.name),
        ),
      }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.expense] }
    case 'REMOVE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.id),
      }
    default:
      return state
  }
}

const initialState: State = {
  participants: [],
  expenses: [],
}

function newId(): string {
  return crypto.randomUUID()
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const derived = useMemo(() => {
    const balancesRaw = computeBalances(state.participants, state.expenses)
    const balances: Record<string, number> = {}
    for (const p of state.participants) {
      balances[p] = roundMoney(balancesRaw[p] ?? 0)
    }
    const pairwiseMatrix = buildPairwiseOwedMatrix(
      state.participants,
      state.expenses,
    )
    const transfers = simplifyToTransfers(state.participants, balancesRaw)
    return { balances, pairwiseMatrix, transfers }
  }, [state.participants, state.expenses])

  const addParticipant = useCallback((name: string) => {
    dispatch({ type: 'ADD_PARTICIPANT', name })
  }, [])

  const removeParticipant = useCallback((name: string) => {
    dispatch({ type: 'REMOVE_PARTICIPANT', name })
  }, [])

  const addExpense = useCallback((input: Omit<Expense, 'id'>) => {
    dispatch({
      type: 'ADD_EXPENSE',
      expense: { ...input, id: newId() },
    })
  }, [])

  const removeExpense = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_EXPENSE', id })
  }, [])

  const value = useMemo<ExpenseContextValue>(
    () => ({
      participants: state.participants,
      expenses: state.expenses,
      balances: derived.balances,
      pairwiseMatrix: derived.pairwiseMatrix,
      transfers: derived.transfers,
      addParticipant,
      removeParticipant,
      addExpense,
      removeExpense,
    }),
    [
      state.participants,
      state.expenses,
      derived.balances,
      derived.pairwiseMatrix,
      derived.transfers,
      addParticipant,
      removeParticipant,
      addExpense,
      removeExpense,
    ],
  )

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  )
}
