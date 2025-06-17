import React from 'react';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  console.log('Transactions received in TransactionList.jsx:', transactions);

  // Get current month and year
  const currentDate = new Date();
  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (!transactions.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No transactions yet. Add your first transaction above!
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-lg overflow-hidden dark:from-gray-800 dark:to-gray-900">
      {/* Month/Year Display */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600">
        <h2 className="text-xl font-semibold text-white drop-shadow-sm">{monthYear}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700/50">
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider dark:text-gray-300">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider dark:text-gray-300">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider dark:text-gray-300">
                Credit
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider dark:text-gray-300">
                Debit
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider dark:text-gray-300">
                Balance
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {transactions.map((transaction) => {
              const displayBalance = Number(transaction.balance);
              console.log('Raw balance:', transaction.balance, 'Processed balance:', displayBalance);
              return (
                <tr key={transaction.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                    {transaction.usedFor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {transaction.credit ? `${Number(transaction.credit).toLocaleString('en-CM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-rose-600 dark:text-rose-400">
                    {transaction.debit ? `${Number(transaction.debit).toLocaleString('en-CM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-800 dark:text-gray-100">
                    {!isNaN(displayBalance) ? `${displayBalance.toLocaleString('en-CM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList; 