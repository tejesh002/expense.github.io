export type Expense = {
  id: string
  title: string
  price: number
  /** Participant names who share this expense equally */
  splitTo: string[]
  /** Participant who paid */
  spendBy: string
}

export type Transfer = {
  from: string
  to: string
  amount: number
}
