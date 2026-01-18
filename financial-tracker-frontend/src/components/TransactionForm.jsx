import React, { useState, useEffect } from 'react'

const TransactionForm = ({
  onSubmit,
  editingTransaction,
  setEditingTransaction,
}) => {
  const [formData, setFormData] = useState({
    usedFor: '',
    credit: '',
    debit: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Effect to populate form when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        usedFor: editingTransaction.usedFor || '',
        credit: editingTransaction.credit
          ? String(editingTransaction.credit)
          : '',
        debit: editingTransaction.debit ? String(editingTransaction.debit) : '',
      })
    } else {
      // Clear form if no transaction is being edited
      setFormData({
        usedFor: '',
        credit: '',
        debit: '',
      })
    }
    setErrors({}) // Clear errors when editing state changes
  }, [editingTransaction])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.usedFor.trim()) {
      newErrors.usedFor = 'Description is required'
    }
    if (!formData.credit && !formData.debit) {
      newErrors.amount = 'Either credit or debit amount is required'
    }
    if (formData.credit && formData.debit) {
      newErrors.amount = 'Cannot have both credit and debit'
    }
    if (formData.credit && parseFloat(formData.credit) <= 0) {
      newErrors.credit = 'Credit amount must be positive'
    }
    if (formData.debit && parseFloat(formData.debit) <= 0) {
      newErrors.debit = 'Debit amount must be positive'
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        ...formData,
        credit: formData.credit ? parseFloat(formData.credit) : null,
        debit: formData.debit ? parseFloat(formData.debit) : null,
      })
      // Reset form after successful submission
      setFormData({
        usedFor: '',
        credit: '',
        debit: '',
      })
      setErrors({})
      // Clear editing state if applicable
      if (editingTransaction) {
        setEditingTransaction(null)
      }
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-premium-fade space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="usedFor"
          className="dark:text-slate-300 ml-1 block text-sm font-semibold text-slate-700"
        >
          Description
        </label>
        <input
          type="text"
          id="usedFor"
          name="usedFor"
          value={formData.usedFor}
          onChange={handleChange}
          className={`input-field ${errors.usedFor ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
          placeholder="What was this transaction for?"
        />
        {errors.usedFor && (
          <p className="dark:text-rose-400 ml-1 mt-1 text-sm font-medium text-rose-600">
            {errors.usedFor}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="credit"
            className="dark:text-slate-300 ml-1 block text-sm font-semibold text-slate-700"
          >
            Credit Amount (Income)
          </label>
          <div className="relative">
            <input
              type="number"
              id="credit"
              name="credit"
              value={formData.credit}
              onChange={handleChange}
              disabled={!!formData.debit && formData.debit !== ''}
              step="0.01"
              min="0"
              className={`input-field pr-16 ${errors.credit ? 'border-rose-500 ring-2 ring-rose-500/20' : ''} ${!!formData.debit && formData.debit !== '' ? 'cursor-not-allowed opacity-40 grayscale' : ''}`}
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              FCFA
            </span>
          </div>
          {errors.credit && (
            <p className="dark:text-rose-400 ml-1 mt-1 text-sm font-medium text-rose-600">
              {errors.credit}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="debit"
            className="dark:text-slate-300 ml-1 block text-sm font-semibold text-slate-700"
          >
            Debit Amount (Expense)
          </label>
          <div className="relative">
            <input
              type="number"
              id="debit"
              name="debit"
              value={formData.debit}
              onChange={handleChange}
              disabled={!!formData.credit && formData.credit !== ''}
              step="0.01"
              min="0"
              className={`input-field pr-16 ${errors.debit ? 'border-rose-500 ring-2 ring-rose-500/20' : ''} ${!!formData.credit && formData.credit !== '' ? 'cursor-not-allowed opacity-40 grayscale' : ''}`}
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              FCFA
            </span>
          </div>
          {errors.debit && (
            <p className="dark:text-rose-400 ml-1 mt-1 text-sm font-medium text-rose-600">
              {errors.debit}
            </p>
          )}
        </div>
      </div>

      {(errors.amount || errors.submit) && (
        <div className="dark:text-rose-400 animate-pulse rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-600">
          {errors.amount || errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="interactive-button premium-gradient w-full text-lg shadow-indigo-500/20"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : editingTransaction ? (
          'Update Transaction'
        ) : (
          'Add Transaction'
        )}
      </button>
    </form>
  )
}

export default TransactionForm
