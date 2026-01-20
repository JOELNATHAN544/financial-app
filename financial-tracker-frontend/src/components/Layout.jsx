import React, { useState, useEffect } from 'react'
import { FiSun, FiMoon, FiPieChart, FiTarget, FiRepeat } from 'react-icons/fi'

const Layout = ({ children, onLogout, theme, toggleTheme, onShowSettings, onShowDashboard, onShowBudgets, onShowRecurring }) => {
  const [showOfferingNotification, setShowOfferingNotification] =
    useState(false)

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
      <header className="dark:bg-slate-950/60 dark:border-slate-800/50 sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/60 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div
            className="group flex cursor-pointer items-center space-x-3"
            onClick={() => (window.location.href = '/')}
          >
            <div className="premium-gradient flex h-12 w-12 transform items-center justify-center rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-500 group-hover:rotate-12">
              <span className="text-2xl font-bold text-white">$</span>
            </div>
            <h1 className="dark:from-white dark:to-slate-400 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              FinanceFlow
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="glass-card hover:premium-gradient group rounded-2xl border-none p-3 transition-all duration-500"
              title={
                theme === 'dark'
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
              }
            >
              {theme === 'dark' ? (
                <FiSun
                  size={20}
                  className="transition-transform duration-500 group-hover:rotate-90"
                />
              ) : (
                <FiMoon
                  size={20}
                  className="transition-transform duration-500 group-hover:-rotate-12"
                />
              )}
            </button>

            {onShowDashboard && (
              <button
                onClick={onShowDashboard}
                className="glass-card hover:premium-gradient rounded-2xl border-none p-3 transition-all duration-500"
                title="Financial Dashboard"
                aria-label="Financial Dashboard"
              >
                <FiPieChart size={20} />
              </button>
            )}

            {onShowBudgets && (
              <button
                onClick={onShowBudgets}
                className="glass-card hover:premium-gradient rounded-2xl border-none p-3 transition-all duration-500"
                title="Budgeting"
                aria-label="Budgeting"
              >
                <FiTarget size={20} />
              </button>
            )}

            {onShowRecurring && (
              <button
                onClick={onShowRecurring}
                className="glass-card hover:premium-gradient rounded-2xl border-none p-3 transition-all duration-500"
                title="Recurring Transactions"
                aria-label="Recurring Transactions"
              >
                <FiRepeat size={20} />
              </button>
            )}

            {onShowSettings && (
              <button
                onClick={onShowSettings}
                className="glass-card hover:premium-gradient rounded-2xl border-none p-3 transition-all duration-500"
                title="Account Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="interactive-button bg-rose-500/90 text-white shadow-xl shadow-rose-500/30 hover:bg-rose-600"
              >
                Logout
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
