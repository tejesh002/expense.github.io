import type { Expense, Transfer } from '../types'

const EPS = 0.005

/** Net balance: positive = should receive overall, negative = should pay overall */
export function computeBalances(
  participants: string[],
  expenses: Expense[],
): Record<string, number> {
  const balance: Record<string, number> = {}
  for (const p of participants) balance[p] = 0

  for (const e of expenses) {
    const n = e.splitTo.length
    if (n === 0) continue
    const share = e.price / n
    balance[e.spendBy] = (balance[e.spendBy] ?? 0) + e.price
    for (const name of e.splitTo) {
      balance[name] = (balance[name] ?? 0) - share
    }
  }
  return balance
}

/**
 * Matrix[i][j] = amount participant i pays to participant j (direct split attribution).
 * Rows/columns follow `participants` order.
 */
export function buildPairwiseOwedMatrix(
  participants: string[],
  expenses: Expense[],
): number[][] {
  const idx = new Map(participants.map((p, i) => [p, i]))
  const n = participants.length
  const m: number[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => 0),
  )

  for (const e of expenses) {
    const splitCount = e.splitTo.length
    if (splitCount === 0) continue
    const share = e.price / splitCount
    const payerIdx = idx.get(e.spendBy)
    if (payerIdx === undefined) continue
    for (const name of e.splitTo) {
      if (name === e.spendBy) continue
      const i = idx.get(name)
      if (i === undefined) continue
      m[i][payerIdx] += share
    }
  }
  return m
}

/** Greedy settlement so total cash movement matches net balances */
export function simplifyToTransfers(
  participants: string[],
  balances: Record<string, number>,
): Transfer[] {
  const debtors: { name: string; amount: number }[] = []
  const creditors: { name: string; amount: number }[] = []

  for (const p of participants) {
    const b = balances[p] ?? 0
    if (b < -EPS) debtors.push({ name: p, amount: -b })
    else if (b > EPS) creditors.push({ name: p, amount: b })
  }

  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const transfers: Transfer[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    if (pay > EPS) {
      transfers.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: roundMoney(pay),
      })
    }
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount < EPS) i++
    if (creditors[j].amount < EPS) j++
  }
  return transfers
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}
