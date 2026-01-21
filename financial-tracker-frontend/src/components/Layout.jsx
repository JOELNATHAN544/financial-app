import React, { useState, useEffect } from 'react'
import { FiPieChart, FiTarget, FiRepeat, FiSettings, FiActivity } from 'react-icons/fi'

const NavButton = ({ onClick, icon, label, active }) => {
  const Icon = icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold ${active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
        }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-400'}`} />
      <span>{label}</span>
    </button>
  )
}

const Layout = ({ children, onShowSettings, onShowDashboard, onShowBudgets, onShowRecurring }) => {
  const [showOfferingNotification, setShowOfferingNotification] = useState(false)

  useEffect(() => {
    const today = new Date()
    // Check if today is Sunday (getDay() returns 0 for Sunday)
    if (today.getDay() === 0) {
      setShowOfferingNotification(true)
    }
  }, [])

  const handleCloseNotification = () => {
    setShowOfferingNotification(false)
  }

  return (
    <div className="min-h-screen transition-colors duration-500">
      <header className="dark:bg-slate-950/80 dark:border-slate-800/50 sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div
            className="group flex cursor-pointer items-center space-x-4"
            onClick={() => (window.location.href = '/')}
          >
            <div className="premium-gradient flex h-14 w-14 transform items-center justify-center rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
              <span className="text-3xl font-black text-white">$</span>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-black tracking-tighter text-transparent dark:from-indigo-400 dark:to-violet-400">
                FinanceFlow
              </h1>
              <p className="hidden text-xs font-bold uppercase tracking-widest text-slate-400 sm:block dark:text-slate-600">
                Premium Tracker
              </p>
            </div>
          </div>

          <nav className="flex items-center space-x-2">
            {onShowDashboard && (
              <NavButton onClick={onShowDashboard} icon={FiPieChart} label="Dashboard" />
            )}

            {onShowBudgets && (
              <NavButton onClick={onShowBudgets} icon={FiTarget} label="Budgets" />
            )}

            {onShowRecurring && (
              <NavButton onClick={onShowRecurring} icon={FiRepeat} label="Recurring" />
            )}

            {/* Advisor Link - if we implement strict route later, for now sticking to core */}
            {/* <NavButton onClick={onShowAdvisor} icon={FiActivity} label="Advisor" /> */}
          </nav>

          <div className="flex items-center pl-6 border-l border-slate-200 dark:border-slate-800 ml-6">
            {onShowSettings && (
              <button
                type="button"
                onClick={onShowSettings}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all group"
              >
                <FiSettings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                <span>Settings</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="animate-fade-in mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>

      {showOfferingNotification && (
        <div className="glass-card animate-slide-up fixed bottom-8 right-8 z-50 max-w-sm border-l-4 border-indigo-500 p-6">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="dark:text-indigo-400 text-lg font-bold text-indigo-600">
                Sunday's Blessing
              </h3>
              <p className="dark:text-gray-300 mt-1 text-sm text-gray-600">
                "Honour the LORD with thy substance, and with the firstfruits of
                all thine increase."
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseNotification}
              className="ml-4 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Close notification"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout
