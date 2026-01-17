import React, { useState, useEffect } from 'react';

const TransactionForm = ({ onSubmit, editingTransaction, setEditingTransaction }) => {
  const [formData, setFormData] = useState({
    usedFor: '',
    credit: '',
    debit: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to populate form when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        usedFor: editingTransaction.usedFor || '',
        credit: editingTransaction.credit ? String(editingTransaction.credit) : '',
        debit: editingTransaction.debit ? String(editingTransaction.debit) : '',
      });
    } else {
      // Clear form if no transaction is being edited
      setFormData({
        usedFor: '',
        credit: '',
        debit: '',
      });
    }
    setErrors({}); // Clear errors when editing state changes
  }, [editingTransaction]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.usedFor.trim()) {
      newErrors.usedFor = 'Description is required';
    }
    if (!formData.credit && !formData.debit) {
      newErrors.amount = 'Either credit or debit amount is required';
    }
    if (formData.credit && formData.debit) {
      newErrors.amount = 'Cannot have both credit and debit';
    }
    if (formData.credit && parseFloat(formData.credit) <= 0) {
      newErrors.credit = 'Credit amount must be positive';
    }
    if (formData.debit && parseFloat(formData.debit) <= 0) {
      newErrors.debit = 'Debit amount must be positive';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        credit: formData.credit ? parseFloat(formData.credit) : null,
        debit: formData.debit ? parseFloat(formData.debit) : null,
      });
      // Reset form after successful submission
      setFormData({
        usedFor: '',
        credit: '',
        debit: '',
      });
      setErrors({});
      // Clear editing state if applicable
      if (editingTransaction) {
        setEditingTransaction(null);
      }
    } catch (error) {
      setErrors({ submit: error.message });
      throw error; // Re-throw so App.jsx can handle logout
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="usedFor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <input
          type="text"
          id="usedFor"
          name="usedFor"
          value={formData.usedFor}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
            ${errors.usedFor ? 'border-red-500' : ''
            }`}
          placeholder="What was this transaction for?"
        />
        {errors.usedFor && (
          <p className="mt-1 text-sm text-red-600">{errors.usedFor}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="credit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Credit Amount (Income)
          </label>
          <input
            type="number"
            id="credit"
            name="credit"
            value={formData.credit}
            onChange={handleChange}
            disabled={!!formData.debit && formData.debit !== ''}
            step="0.01"
            min="0"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
              dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
              ${errors.credit ? 'border-red-500' : ''}
              ${(!!formData.debit && formData.debit !== '') ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}
            `}
            placeholder="0.00"
          />
          {errors.credit && (
            <p className="mt-1 text-sm text-red-600">{errors.credit}</p>
          )}
        </div>

        <div>
          <label htmlFor="debit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Debit Amount (Expense)
          </label>
          <input
            type="number"
            id="debit"
            name="debit"
            value={formData.debit}
            onChange={handleChange}
            disabled={!!formData.credit && formData.credit !== ''}
            step="0.01"
            min="0"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
              dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
              ${errors.debit ? 'border-red-500' : ''}
              ${(!!formData.credit && formData.credit !== '') ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}
            `}
            placeholder="0.00"
          />
          {errors.debit && (
            <p className="mt-1 text-sm text-red-600">{errors.debit}</p>
          )}
        </div>
      </div>

      {errors.amount && (
        <p className="text-sm text-red-600">{errors.amount}</p>
      )}

      {errors.submit && (
        <p className="text-sm text-red-600">{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        {isSubmitting
          ? (editingTransaction ? 'Updating Transaction...' : 'Adding Transaction...')
          : (editingTransaction ? 'Update Transaction' : 'Add Transaction')}
      </button>
    </form>
  );
};

export default TransactionForm; 