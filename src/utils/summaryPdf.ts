import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Expense, Transfer } from '../types'
import { formatInr } from './formatInr'

type DocWithTable = jsPDF & { lastAutoTable?: { finalY: number } }

function tableEndY(doc: DocWithTable, gap: number): number {
  return (doc.lastAutoTable?.finalY ?? 40) + gap
}

export function downloadSummaryPdf(params: {
  participants: string[]
  expenses: Expense[]
  balances: Record<string, number>
  pairwiseMatrix: number[][]
  transfers: Transfer[]
}): void {
  const {
    participants,
    expenses,
    balances,
    pairwiseMatrix,
    transfers,
  } = params

  const orientation =
    participants.length > 5 || expenses.length > 10 ? 'landscape' : 'portrait'
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' }) as DocWithTable
  const margin = 14
  let y = 16

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Expense tracker summary', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(90)
  y += 7
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, margin, y)
  doc.setTextColor(0)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`Total participants: ${participants.length}`, margin, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['#', 'Name']],
    body: participants.map((p, i) => [String(i + 1), p]),
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 10 },
    columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 'auto' } },
  })
  y = tableEndY(doc, 8)

  const expenseRows =
    expenses.length > 0
      ? expenses.map((e) => [
          e.title,
          formatInr(e.price),
          e.splitTo.join(', '),
          e.spendBy,
        ])
      : [['—', '—', 'No expenses yet', '—']]

  autoTable(doc, {
    startY: y,
    head: [['Title', 'Amount (INR)', 'Split between', 'Paid by']],
    body: expenseRows,
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 9, cellPadding: 2 },
  })
  y = tableEndY(doc, 6)

  if (expenses.length > 0) {
    const total = expenses.reduce((s, e) => s + e.price, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Expenses total: ${formatInr(total)}`, margin, y)
    doc.setFont('helvetica', 'normal')
    y += 8
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Net balance', margin, y)
  y += 2

  const balanceBody = participants.map((p) => {
    const b = balances[p] ?? 0
    const label = b > 0 ? 'receives' : b < 0 ? 'owes' : 'settled'
    return [p, `${b >= 0 ? '+' : ''}${formatInr(b)}`, label]
  })

  autoTable(doc, {
    startY: y + 4,
    head: [['Participant', 'Amount', '']],
    body: balanceBody,
    theme: 'grid',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 9 },
  })
  y = tableEndY(doc, 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Who pays whom (simplified)', margin, y)
  y += 2

  const transferBody =
    transfers.length > 0
      ? transfers.map((t) => [t.from, t.to, formatInr(t.amount)])
      : [
          [
            '—',
            expenses.length === 0 ? 'Add expenses first' : 'All settled',
            '—',
          ],
        ]

  autoTable(doc, {
    startY: y + 4,
    head: [['From', 'To', 'Amount (INR)']],
    body: transferBody,
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 9 },
  })
  y = tableEndY(doc, 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Final matrix (row → owes → column)', margin, y)
  y += 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80)
  const pageW = doc.internal.pageSize.getWidth()
  doc.text(
    'From direct splits before netting. Diagonal is empty.',
    margin,
    y + 4,
    { maxWidth: pageW - 2 * margin },
  )
  doc.setTextColor(0)
  y += 10

  if (participants.length === 0 || expenses.length === 0) {
    doc.setFontSize(9)
    doc.text('No matrix data (add expenses to populate).', margin, y)
  } else {
    const short = (s: string, max = 14) =>
      s.length > max ? `${s.slice(0, max - 1)}…` : s
    const head = [''].concat(participants.map((p) => short(p)))
    const body = participants.map((row, i) => [
      short(row),
      ...participants.map((_, j) => {
        if (i === j) return '—'
        const v = pairwiseMatrix[i]?.[j] ?? 0
        return v > 0 ? formatInr(v) : '—'
      }),
    ])

    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      theme: 'grid',
      headStyles: { fillColor: [45, 55, 72], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 1 },
      horizontalPageBreak: participants.length > 8,
    })
  }

  const safe = new Date().toISOString().slice(0, 10)
  doc.save(`expense-summary-${safe}.pdf`)
}
