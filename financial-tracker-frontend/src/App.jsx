import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Auth from './components/Auth'
import Settings from './components/Settings'
import Dashboard from './components/Dashboard'
import BudgetManager from './components/BudgetManager'
import RecurringManager from './components/RecurringManager'
import { api, AuthError } from './api'

import LandingPage from './components/LandingPage'
import HistoryPage from './components/HistoryPage'
import ConfirmationModal from './components/ConfirmationModal'

function App() {
  const [transactions, setTransactions] = useState([])
  const [finalizationHistory, setFinalizationHistory] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'))
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [showSettings, setShowSettings] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showBudgets, setShowBudgets] = useState(false)
  const [showRecurring, setShowRecurring] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [user, setUser] = useState(null)

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isDangerous: false
  })

  // Auth Flow State
  const [showAuth, setShowAuth] = useState(false)
  const [authInitialMode, setAuthInitialMode] = useState('login')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  useEffect(() => {
    // Handle OAuth2 callback - checking both query params and hash fragment
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))

    const token = urlParams.get('token') || hashParams.get('token')
    const refreshToken = urlParams.get('refreshToken') || hashParams.get('refreshToken')

    if (token) {
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      handleLogin(token)
      // Clean up URL (both search and hash)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (jwtToken) {
      fetchTransactions()
      fetchFinalizationHistory()
      fetchUserProfile()
    }
  }, [jwtToken])

  const fetchUserProfile = async () => {
    try {
      const data = await api.get('/api/users/me')
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleLogin = (token) => {
    localStorage.setItem('jwtToken', token)
    setJwtToken(token)
  }

  const handleLogout = () => {
    localStorage.removeItem('jwtToken')
    setJwtToken(null)
    setTransactions([])
    setFinalizationHistory([])
    setUser(null)
    setShowSettings(false)
    setShowDashboard(false)
    setShowBudgets(false)
    setShowRecurring(false)
    setShowHistory(false)
    setShowAuth(false)
    setAuthInitialMode('login')
  }

  const handleDeleteAccount = () => {
    handleLogout()
  }

  const fetchTransactions = async () => {
    try {
      const data = await api.get('/api/transactions')
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const fetchFinalizationHistory = async () => {
    try {
      const data = await api.get('/api/transactions/history')
      setFinalizationHistory(data)
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const handleSubmitTransaction = async (transaction) => {
    try {
      if (editingTransaction) {
        await api.put(`/api/transactions/${editingTransaction.id}`, transaction)
        setEditingTransaction(null)
      } else {
        await api.post('/api/transactions', transaction)
      }
      fetchTransactions()
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await api.delete(`/api/transactions/${id}`)
          fetchTransactions()
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          console.error('Error deleting transaction:', error)
        }
      }
    })
  }

  if (!jwtToken) {
    if (showAuth) {
      return (
        <Auth
          onLogin={handleLogin}
          onBack={() => setShowAuth(false)}
          initialMode={authInitialMode}
        />
      )
    }
    return (
      <LandingPage
        onLoginClick={() => {
          setAuthInitialMode('login')
          setShowAuth(true)
        }}
        onRegisterClick={() => {
          setAuthInitialMode('register')
          setShowAuth(true)
        }}
      />
    )
  }

  const activeView = showDashboard ? 'dashboard' : showBudgets ? 'budgets' : showRecurring ? 'recurring' : showHistory ? 'history' : 'dashboard'

  return (
    <Layout
      activeView={activeView}
      onLogout={handleLogout}
      theme={theme}
      toggleTheme={toggleTheme}
      onShowSettings={() => { setShowSettings(true); setShowDashboard(false); setShowBudgets(false); setShowRecurring(false); setShowHistory(false); }}
      onShowDashboard={() => { setShowDashboard(true); setShowSettings(false); setShowBudgets(false); setShowRecurring(false); setShowHistory(false); }}
      onShowBudgets={() => { setShowBudgets(true); setShowSettings(false); setShowDashboard(false); setShowRecurring(false); setShowHistory(false); }}
      onShowRecurring={() => {
        setShowDashboard(false)
        setShowSettings(false)
        setShowBudgets(false)
        setShowRecurring(true)
        setShowHistory(false)
      }}
      onShowHistory={() => {
        setShowDashboard(false)
        setShowSettings(false)
        setShowBudgets(false)
        setShowRecurring(false)
        setShowHistory(true)
      }}
    >
      <div className="mx-auto max-w-5xl space-y-10">
        {showSettings ? (
          <Settings
            jwtToken={jwtToken}
            user={user}
            theme={theme}
            toggleTheme={toggleTheme}
            onDelete={handleDeleteAccount}
            onCancel={() => setShowSettings(false)}
            onLogout={handleLogout}
            onUpdate={fetchUserProfile}
          />
        ) : showBudgets ? (
          <BudgetManager jwtToken={jwtToken} />
        ) : showRecurring ? (
          <RecurringManager jwtToken={jwtToken} />
        ) : showHistory ? (
          <HistoryPage
            finalizationHistory={finalizationHistory}
            onBack={() => {
              setShowHistory(false)
              setShowDashboard(true)
            }}
          />
        ) : (
          <div className="space-y-12">
            <section className="glass-card group relative overflow-hidden p-10">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-indigo-500/5 transition-transform duration-700 group-hover:scale-150"></div>
              <h2 className="dark:text-white mb-8 flex items-center text-3xl font-black tracking-tight text-slate-900">
                <span className="mr-4 h-8 w-2 rounded-full bg-indigo-500"></span>
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <TransactionForm
                onSubmit={handleSubmitTransaction}
                editingTransaction={editingTransaction}
                setEditingTransaction={setEditingTransaction}
              />
              {editingTransaction && (
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 mt-6 rounded-xl bg-slate-100 px-6 py-2 font-bold text-slate-600 transition-all duration-300 hover:bg-slate-200"
                >
                  Cancel Edit
                </button>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-end justify-between px-2">
                <div>
                  <h2 className="dark:text-white text-3xl font-black tracking-tight text-slate-900">
                    Current Transactions
                  </h2>
                  <p className="dark:text-slate-400 mt-1 font-medium text-slate-500">
                    Real-time financial tracking for this period
                  </p>
                </div>
              </div>
              <TransactionList
                transactions={transactions}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </section>
          </div >
        )
        }
      </div >

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.isDangerous ? 'Delete' : 'Confirm'}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </Layout >
  )
}

export default App
