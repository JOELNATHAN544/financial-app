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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-800">
      {/* Month/Year Display */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700">
        <h2 className="text-xl font-semibold text-white">{monthYear}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Credit
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Debit
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Balance
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {transactions.map((transaction) => {
              const displayBalance = Number(transaction.balance);
              console.log('Raw balance:', transaction.balance, 'Processed balance:', displayBalance);
              return (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {transaction.usedFor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                    {transaction.credit ? `${Number(transaction.credit).toLocaleString('en-CM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600 dark:text-red-400">
                    {transaction.debit ? `${Number(transaction.debit).toLocaleString('en-CM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                    {!isNaN(displayBalance) ? `${displayBalance.toLocaleString('en-CM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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