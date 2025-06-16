import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const Layout = ({ children, onLogout, theme, toggleTheme }) => {
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
    </div>
  );
};

export default Layout; 