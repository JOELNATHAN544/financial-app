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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Tracker
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {theme === 'dark' ? (
                <><FiSun className="mr-2" />Light Mode</>
              ) : (
                <><FiMoon className="mr-2" />Dark Mode</>
              )}
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {showOfferingNotification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center justify-between space-x-4 animate-fade-in-down dark:bg-blue-800">
          <p className="font-medium text-sm md:text-base">Don't forget to give your offering today!</p>
          <button
            onClick={handleCloseNotification}
            className="ml-4 text-white hover:text-blue-200 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout; 