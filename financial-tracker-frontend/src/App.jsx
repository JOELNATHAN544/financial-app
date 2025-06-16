import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Auth from './components/Auth'

function App() {
  const [transactions, setTransactions] = useState([])
  const [finalizationHistory, setFinalizationHistory] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken')) // Initialize from localStorage

  // New state for theme
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (jwtToken) {
      fetchTransactions()
      fetchFinalizationHistory()
    }
  }, [jwtToken]) // Depend on jwtToken

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/transactions', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      setTransactions(data)
      console.log('Transactions fetched in App.jsx:', data); // Added console log
    } catch (error) {
      console.error('Error fetching transactions:', error)
      if (error.message.includes('403') || error.message.includes('401')) {
        // If unauthorized, clear token and force re-login
        handleLogout();
      }
    }
  }

  const fetchFinalizationHistory = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/transactions/finalization-history', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch finalization history')
      }
      const data = await response.json()
      setFinalizationHistory(data)
    } catch (error) {
      console.error('Error fetching finalization history:', error)
      if (error.message.includes('403') || error.message.includes('401')) {
        handleLogout();
      }
    }
  }

  const handleSubmitTransaction = async (transactionData) => {
    try {
      let response;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      };

      if (editingTransaction) {
        response = await fetch(`http://localhost:8081/api/transactions/${editingTransaction.id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(transactionData),
        })
      } else {
        response = await fetch('http://localhost:8081/api/transactions', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(transactionData),
        })
      }

      if (!response.ok) {
        throw new Error('Failed to save transaction')
      }

      await fetchTransactions()
      setEditingTransaction(null)
    } catch (error) {
      console.error('Error saving transaction:', error)
      if (error.message.includes('403') || error.message.includes('401')) {
        handleLogout();
      }
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8081/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      await fetchTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      if (error.message.includes('403') || error.message.includes('401')) {
        handleLogout();
      }
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
    <Layout handleLogout={handleLogout} currentTheme={theme} toggleTheme={toggleTheme}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        <TransactionForm
          onSubmit={handleSubmitTransaction}
          editingTransaction={editingTransaction}
          setEditingTransaction={setEditingTransaction}
        />
        {editingTransaction && (
          <button
            onClick={() => setEditingTransaction(null)}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel Edit
          </button>
        )}
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Transactions</h2>
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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

