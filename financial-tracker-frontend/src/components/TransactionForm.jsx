import React, { useState, useEffect } from 'react'
import CurrencySelector from './CurrencySelector'

const TransactionForm = ({
  onSubmit,
  editingTransaction,
  setEditingTransaction,
}) => {
  const [formData, setFormData] = useState({
    usedFor: '',
    credit: '',
    debit: '',
    currency: 'XAF',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceDebug, setVoiceDebug] = useState('')

  const categories = [
    'Food',
    'Transport',
    'Rent',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Health',
    'Investment',
    'Education',
    'Others',
  ]

  // Effect to populate form when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        usedFor: editingTransaction.usedFor || '',
        credit: editingTransaction.credit
          ? String(editingTransaction.credit)
          : '',
        debit: editingTransaction.debit ? String(editingTransaction.debit) : '',
        currency: editingTransaction.currency || 'XAF',
      })
    } else {
      // Clear form if no transaction is being edited
      setFormData({
        usedFor: '',
        credit: '',
        debit: '',
        currency: 'XAF',
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
        currency: 'XAF',
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
      <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        <div className="space-y-2">
          <label className="dark:text-slate-300 ml-1 block text-sm font-semibold text-slate-700">
            Category
          </label>
          <select
            name="category"
            value={categories.includes(formData.usedFor) ? formData.usedFor : 'Others'}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, usedFor: val }));
            }}
            className="input-field"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="usedFor"
            className="dark:text-slate-300 ml-1 block text-sm font-semibold text-slate-700"
          >
            Detailed Description
          </label>
          <input
            type="text"
            id="usedFor"
            name="usedFor"
            value={formData.usedFor}
            onChange={handleChange}
            className={`input-field ${errors.usedFor ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
            placeholder="What was this for?"
          />
          {errors.usedFor && (
            <p className="dark:text-rose-400 ml-1 mt-1 text-sm font-medium text-rose-600">
              {errors.usedFor}
            </p>
          )}
        </div>
      </div>

      {/* Voice Input Section */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            if (isListening) {
              setIsListening(false)
              return
            }

            const SpeechRecognition =
              window.SpeechRecognition || window.webkitSpeechRecognition

            if (!SpeechRecognition) {
              alert('Your browser does not support voice input.')
              return
            }

            const recognition = new SpeechRecognition()
            recognition.continuous = false
            recognition.interimResults = false
            recognition.lang = 'en-US'

            recognition.onstart = () => {
              setIsListening(true)
              setVoiceDebug('Listening...')
            }
            recognition.onend = () => setIsListening(false)
            recognition.onerror = (event) => {
              console.error('Speech recognition error', event.error)
              setIsListening(false)
              if (event.error === 'network') {
                setVoiceDebug('Error: Network (Check Internet/Browser)')
              } else if (event.error === 'not-allowed') {
                setVoiceDebug('Error: Mic Permission Denied')
              } else {
                setVoiceDebug(`Error: ${event.error}`)
              }
            }

            recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript.toLowerCase()
              console.log('Voice transcript:', transcript)
              setVoiceDebug(`Heard: "${transcript}"`)

              // Parsing Logic
              // 1. Amount Extraction (Robust)
              // First, normalize text: remove commas in numbers, convert words to numbers
              let normalizedTranscript = transcript.replace(/,/g, '') // "200,000" -> "200000"

              // Word multipliers
              normalizedTranscript = normalizedTranscript
                .replace(/(\d+)\s*k\b/g, (match, p1) => parseInt(p1) * 1000)
                .replace(/(\d+)\s*thousand\b/g, (match, p1) => parseInt(p1) * 1000)
                .replace(/(\d+)\s*million\b/g, (match, p1) => parseInt(p1) * 1000000)

              // Simple word-to-digit for small numbers if needed, but "one million" usually comes as "1 million" from API. 
              // If API sends "one million", we might need a library, but let's handle "a million" or "one million" simply if common.
              // For now assuming digits.

              const amountMatch = normalizedTranscript.match(/(\d+(?:\.\d{1,2})?)/)
              const amount = amountMatch ? amountMatch[0] : ''

              // 2. Currency
              let currency = 'XAF'
              if (normalizedTranscript.includes('dollar') || normalizedTranscript.includes('usd'))
                currency = 'USD'
              else if (normalizedTranscript.includes('euro') || normalizedTranscript.includes('eur'))
                currency = 'EUR'
              else if (
                normalizedTranscript.includes('pound') ||
                normalizedTranscript.includes('gbp')
              )
                currency = 'GBP'

              // 3. Type (Credit/Debit)
              let isCredit = false
              if (
                normalizedTranscript.includes('received') ||
                normalizedTranscript.includes('receive') ||
                normalizedTranscript.includes('got') ||
                normalizedTranscript.includes('income') ||
                normalizedTranscript.includes('earned') ||
                normalizedTranscript.includes('salary') ||
                normalizedTranscript.includes('deposit')
              ) {
                isCredit = true
              }

              // 4. Description extraction strategy
              let description = transcript
              const expenseSplit = transcript.split(/\s(on|for)\s/)
              if (!isCredit && expenseSplit.length > 1) {
                description = expenseSplit[expenseSplit.length - 1]
              }

              const incomeSplit = transcript.split(/\s(from|of)\s/)
              if (isCredit && incomeSplit.length > 1) {
                description = incomeSplit[incomeSplit.length - 1]
              }

              // Cleanup description (remove punctuation at end)
              description = description.replace(/[.,!?]$/, '')
              // Capitalize first letter
              description =
                description.charAt(0).toUpperCase() + description.slice(1)

              // Update debug detected info
              setVoiceDebug(`Heard: "${transcript}" → ${isCredit ? 'Income' : 'Expense'}`)

              setFormData((prev) => ({
                ...prev,
                usedFor: description,
                currency: currency,
                credit: isCredit ? amount : '',
                debit: !isCredit ? amount : '',
              }))
            }

            recognition.start()
          }}
          className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${isListening
            ? 'bg-rose-500 text-white animate-pulse'
            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-slate-700 dark:text-indigo-400 dark:hover:bg-slate-600'
            }`}
        >
          {isListening ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              <span>Listening...</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>Voice Input</span>
            </>
          )}
        </button>
      </div>
      {voiceDebug && <p className="text-xs text-right text-slate-500 mt-1">{voiceDebug}</p>}

      <div className="space-y-2">
        <label
          htmlFor="currency"
          className="dark:text-slate-300 ml-1 block text-sm font-semibold text-slate-700"
        >
          Currency
        </label>
        <CurrencySelector
          value={formData.currency}
          onChange={(val) => handleChange({ target: { name: 'currency', value: val } })}
          className="w-full"
        />
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
              {formData.currency}
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
              {formData.currency}
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
