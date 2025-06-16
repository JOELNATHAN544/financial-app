import React from 'react';

const Layout = ({ children, onLogout, theme, toggleTheme }) => {
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className="bg-white shadow dark:bg-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Tracker
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
    </div>
  );
};

export default Layout; 