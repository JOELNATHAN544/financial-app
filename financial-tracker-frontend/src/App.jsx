import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'

function App() {
  const [transactions, setTransactions] = useState([])
  const [finalizationHistory, setFinalizationHistory] = useState([])

  useEffect(() => {
    fetchTransactions()
    fetchFinalizationHistory()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/transactions')
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const fetchFinalizationHistory = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/transactions/finalization-history')
      if (!response.ok) {
        throw new Error('Failed to fetch finalization history')
      }
      const data = await response.json()
      setFinalizationHistory(data)
    } catch (error) {
      console.error('Error fetching finalization history:', error)
    }
  }

  const handleAddTransaction = async (transactionData) => {
    try {
      const response = await fetch('http://localhost:8081/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        throw new Error('Failed to add transaction')
      }

      const newTransaction = await response.json()
      setTransactions([...transactions, newTransaction])
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Transaction</h2>
        <TransactionForm onSubmit={handleAddTransaction} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Transactions</h2>
          <TransactionList transactions={transactions} />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Month-End History</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month/Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {finalizationHistory.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.finalizationDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.month}/{log.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(log.closingBalance).toFixed(2)} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App
