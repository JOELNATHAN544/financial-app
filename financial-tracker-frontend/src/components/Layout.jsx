import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const Layout = ({ children, onLogout, theme, toggleTheme }) => {
  const [showOfferingNotification, setShowOfferingNotification] = useState(false);

  useEffect(() => {
    const today = new Date();
    // Check if today is Sunday (getDay() returns 0 for Sunday)
    if (today.getDay() === 0) {
      setShowOfferingNotification(true);
    }
  }, []);

  const handleCloseNotification = () => {
    setShowOfferingNotification(false);
  };

  return (
    <div className="min-h-screen transition-colors duration-500">
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-bold text-xl">$</span>
            </div>
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              FinanceFlow
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl glass-card hover:premium-gradient hover:text-white transition-all duration-300"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="interactive-button bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
        {children}
      </main>

      {showOfferingNotification && (
        <div className="fixed bottom-8 right-8 z-50 glass-card p-6 border-l-4 border-indigo-500 animate-slide-up max-w-sm">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Sunday's Blessing</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">"Honour the LORD with thy substance, and with the firstfruits of all thine increase."</p>
            </div>
            <button
              onClick={handleCloseNotification}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout; 