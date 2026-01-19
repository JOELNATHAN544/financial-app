import React, { useState, useEffect } from 'react'
import { api } from '../api'

const BudgetManager = () => {
    const [budgets, setBudgets] = useState([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

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

    useEffect(() => {
        fetchBudgets()
    }, [])

    const fetchBudgets = async () => {
        try {
            setLoading(true)
            const data = await api.get('/api/budgets/current')
            setBudgets(data)
        } catch (error) {
            console.error('Error fetching budgets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSetBudget = async (e) => {
        e.preventDefault()
        if (!formData.category || !formData.amount) return

        try {
            setIsSubmitting(true)
            await api.post('/api/budgets', {
                category: formData.category,
                amount: parseFloat(formData.amount),
            })
            setMessage({ type: 'success', text: 'Budget updated successfully!' })
            setFormData({ category: '', amount: '' })
            fetchBudgets()
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update budget.' })
        } finally {
            setIsSubmitting(false)
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-semibold text-white">Monthly Budgets</h2>
                <form onSubmit={handleSetBudget} className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-slate-300">Category</label>
                        <select
                            required
                            className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-slate-300">Limit (XAF)</label>
                        <input
                            type="number"
                            required
                            className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. 50000"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white transition-all hover:bg-indigo-50 offensive:opacity-50 disabled:cursor-not-allowed md:w-auto"
                    >
                        {isSubmitting ? 'Setting...' : 'Set Budget'}
                    </button>
                </form>
                {message.text && (
                    <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {message.text}
                    </p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-400">Loading budgets...</div>
                ) : budgets.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400">No budgets set for this month.</div>
                ) : (
                    budgets.map((b) => (
                        <div key={b.category} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="font-medium text-white">{b.category}</span>
                                <span className={`text-sm font-bold ${b.percent > 100 ? 'text-rose-400' : 'text-slate-400'}`}>
                                    {b.percent}%
                                </span>
                            </div>

                            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-700">
                                <div
                                    className={`h-full transition-all duration-500 ${b.percent > 100 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-xs text-slate-400 font-mono">
                                <span>Spent: {b.actual.toLocaleString()} FCFA</span>
                                <span>Limit: {b.budgeted.toLocaleString()} FCFA</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default BudgetManager
