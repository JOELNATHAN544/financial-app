import React from 'react';

const TransactionList = ({ transactions }) => {
  if (!transactions.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions yet. Add your first transaction above!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Credit
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Debit
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => {
            const displayBalance = Number(transaction.balance);
            console.log('Raw balance:', transaction.balance, 'Processed balance:', displayBalance);
            return (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.usedFor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                  {transaction.credit ? `${Number(transaction.credit).toFixed(2)} FCFA` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                  {transaction.debit ? `${Number(transaction.debit).toFixed(2)} FCFA` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {!isNaN(displayBalance) ? `${displayBalance.toFixed(2)} FCFA` : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList; 