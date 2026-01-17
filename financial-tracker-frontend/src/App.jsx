import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Auth from './components/Auth'
import { api } from './api'

function App() {
  const [transactions, setTransactions] = useState([])
  const [finalizationHistory, setFinalizationHistory] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'))
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (jwtToken) {
      fetchTransactions()
      fetchFinalizationHistory()
    }
  }, [jwtToken])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const fetchTransactions = async () => {
    try {
      const data = await api.get('/api/transactions')
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      if (error.message === 'AUTH_UNAUTHORIZED') handleLogout();
    }
  }

  const fetchFinalizationHistory = async () => {
    try {
      const data = await api.get('/api/transactions/finalization-history')
      setFinalizationHistory(data)
    } catch (error) {
      console.error('Error fetching finalization history:', error)
      if (error.message === 'AUTH_UNAUTHORIZED') handleLogout();
    }
  }

  const handleSubmitTransaction = async (transactionData) => {
    try {
      if (editingTransaction) {
        await api.put(`/api/transactions/${editingTransaction.id}`, transactionData)
      } else {
        await api.post('/api/transactions', transactionData)
      }
      await fetchTransactions()
      setEditingTransaction(null)
    } catch (error) {
      console.error('Error saving transaction:', error)
      if (error.message === 'AUTH_UNAUTHORIZED') {
        handleLogout();
      } else {
        // Just throw the error to be handled by the form component
        throw error;
      }
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`)
      await fetchTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      if (error.message === 'AUTH_UNAUTHORIZED') handleLogout();
    }
  }

  const handleLogin = (token) => {
    setJwtToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setJwtToken(null);
    setTransactions([]);
    setFinalizationHistory([]);
  };

  if (!jwtToken) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        <TransactionForm
          onSubmit={handleSubmitTransaction}
          editingTransaction={editingTransaction}
          setEditingTransaction={setEditingTransaction}
        />
        {editingTransaction && (
          <button
            onClick={() => setEditingTransaction(null)}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel Edit
          </button>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Current Transactions</h2>
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Month-End History</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-gray-800 dark:shadow-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Month/Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {finalizationHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(log.finalizationDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {log.month}/{log.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {Number(log.closingBalance).toLocaleString('en-CM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
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

