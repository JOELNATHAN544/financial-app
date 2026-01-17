import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Auth from './components/Auth'
import ProfileSettings from './components/ProfileSettings'
import { api, AuthError } from './api'

function App() {
  const [transactions, setTransactions] = useState([])
  const [finalizationHistory, setFinalizationHistory] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'))
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    // Handle OAuth2 callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      handleLogin(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (jwtToken) {
      fetchTransactions()
      fetchFinalizationHistory()
      fetchUserProfile()
    }
  }, [jwtToken])

  const fetchUserProfile = async () => {
    try {
      const data = await api.get('/api/users/me');
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem('jwtToken', token);
    setJwtToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setJwtToken(null);
    setTransactions([]);
    setFinalizationHistory([]);
    setUser(null);
    setShowSettings(false);
  };

  const handleDeleteAccount = () => {
    handleLogout();
  };

  const fetchTransactions = async () => {
    try {
      const data = await api.get('/api/transactions');
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchFinalizationHistory = async () => {
    try {
      const data = await api.get('/api/transactions/history');
      setFinalizationHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSubmitTransaction = async (transaction) => {
    try {
      if (editingTransaction) {
        await api.put(`/api/transactions/${editingTransaction.id}`, transaction);
        setEditingTransaction(null);
      } else {
        await api.post('/api/transactions', transaction);
      }
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/api/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  if (!jwtToken) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout
      onLogout={handleLogout}
      theme={theme}
      toggleTheme={toggleTheme}
      onShowSettings={() => setShowSettings(true)}
    >
      <div className="space-y-6">
        {showSettings ? (
          <ProfileSettings
            user={user}
            onUpdate={fetchUserProfile}
            onDelete={handleDeleteAccount}
            onCancel={() => setShowSettings(false)}
          />
        ) : (
          <>
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
          </>
        )}
      </div>
    </Layout>
  )
}

export default App

