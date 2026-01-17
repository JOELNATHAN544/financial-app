import React from 'react'

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  console.log('Transactions received in TransactionList.jsx:', transactions)

  // Get current month and year
  const currentDate = new Date()
  const monthYear = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  if (!transactions.length) {
    return (
      <div className="dark:text-gray-400 py-8 text-center text-gray-500">
        No transactions yet. Add your first transaction above!
      </div>
    )
  }

  return (
    <div className="glass-card animate-premium-fade overflow-hidden border-none">
      {/* Month/Year Display */}
      <div className="premium-gradient flex items-center justify-between rounded-none px-8 py-6 shadow-none">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
            {monthYear}
          </h2>
          <p className="text-sm font-medium text-indigo-100 opacity-80">
            Monthly Activity Report
          </p>
        </div>
        <div className="rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md">
          <span className="text-xs font-bold uppercase leading-none tracking-widest text-white">
            {transactions.length} Records
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="dark:divide-slate-800/50 min-w-full divide-y divide-slate-200/50">
          <thead>
            <tr className="dark:bg-slate-900/50 bg-slate-50/50">
              <th
                scope="col"
                className="dark:text-slate-400 px-8 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Date
              </th>
              <th
                scope="col"
                className="dark:text-slate-400 px-8 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Description
              </th>
              <th
                scope="col"
                className="dark:text-slate-400 px-8 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Credit
              </th>
              <th
                scope="col"
                className="dark:text-slate-400 px-8 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Debit
              </th>
              <th
                scope="col"
                className="dark:text-slate-400 px-8 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Balance
              </th>
              <th
                scope="col"
                className="dark:text-slate-400 px-8 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="dark:divide-slate-800/50 divide-y divide-slate-200/50">
            {transactions.map((transaction) => {
              const displayBalance = Number(transaction.balance)
              return (
                <tr
                  key={transaction.id}
                  className="dark:hover:bg-slate-800/30 group transition-all duration-300 hover:bg-slate-100/50"
                >
                  <td className="dark:text-slate-400 whitespace-nowrap px-8 py-5 text-sm font-medium text-slate-500">
                    {new Date(transaction.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="dark:text-slate-100 px-8 py-5 text-sm font-bold text-slate-900">
                    {transaction.usedFor}
                  </td>
                  <td className="dark:text-emerald-400 whitespace-nowrap px-8 py-5 text-right text-sm font-black text-emerald-600">
                    {transaction.credit
                      ? `${Number(transaction.credit).toLocaleString('en-CM')} FCFA`
                      : '—'}
                  </td>
                  <td className="dark:text-rose-400 whitespace-nowrap px-8 py-5 text-right text-sm font-black text-rose-600">
                    {transaction.debit
                      ? `${Number(transaction.debit).toLocaleString('en-CM')} FCFA`
                      : '—'}
                  </td>
                  <td className="dark:text-slate-100 whitespace-nowrap px-8 py-5 text-right text-sm font-black text-slate-900">
                    {!isNaN(displayBalance)
                      ? `${displayBalance.toLocaleString('en-CM')} FCFA`
                      : '—'}
                  </td>
                  <td className="whitespace-nowrap px-8 py-5 text-center text-sm">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="dark:text-indigo-400 rounded-lg p-2 text-indigo-600 transition-all duration-300 hover:bg-indigo-500/10"
                        title="Edit entry"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="dark:text-rose-400 rounded-lg p-2 text-rose-600 transition-all duration-300 hover:bg-rose-500/10"
                        title="Delete entry"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TransactionList
