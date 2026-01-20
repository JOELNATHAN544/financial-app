import React, { useState, useEffect } from 'react'
import { api } from '../api'

const RecurringManager = () => {
    const [recurring, setRecurring] = useState([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        description: '',
        category: 'Others',
        amount: '',
        frequency: 'MONTHLY',
        currency: 'XAF',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const categories = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Investment', 'Education', 'Others']
    const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

    useEffect(() => {
        fetchRecurring()
    }, [])

    const fetchRecurring = async () => {
        try {
            setLoading(true)
            const data = await api.get('/api/recurring')
            setRecurring(data)
        } catch (error) {
            console.error('Error fetching recurring transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.description || !formData.amount) return

        try {
            setIsSubmitting(true)
            await api.post('/api/recurring', {
                ...formData,
                amount: parseFloat(formData.amount),
            })
            setMessage({ type: 'success', text: 'Recurring transaction scheduled!' })
            setFormData({ description: '', category: 'Others', amount: '', frequency: 'MONTHLY', currency: 'XAF' })
            fetchRecurring()
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to schedule.' })
        } finally {
            setIsSubmitting(false)
            setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return
        try {
            await api.delete(`/api/recurring/${id}`)
            fetchRecurring()
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 border-none">
                <h2 className="mb-4 text-xl font-black text-white">Schedule Recurring Transaction</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300">Description</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. Netflix"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300">Category</label>
                        <select
                            className="input-field"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300">Amount (XAF)</label>
                        <input
                            type="number"
                            required
                            className="input-field"
                            placeholder="Amount"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300">Frequency</label>
                        <select
                            className="input-field"
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        >
                            {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="premium-gradient col-span-full rounded-xl py-3 font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Scheduling...' : 'Add Recurring Transaction'}
                    </button>
                </form>
                {message.text && (
                    <p className={`mt-4 text-sm font-bold ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {message.text}
                    </p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-400">Loading templates...</div>
                ) : recurring.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 font-medium">No recurring transactions found.</div>
                ) : (
                    recurring.map((r) => (
                        <div key={r.id} className="glass-card p-5 border-none relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">{r.frequency}</span>
                                    <h3 className="font-bold text-white text-lg">{r.description}</h3>
                                </div>
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">{r.category}</span>
                                <span className="font-black text-rose-400">{Number(r.amount).toLocaleString()} FCFA</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700/50 text-[10px] text-slate-500 font-mono">
                                Next Run: {new Date(r.nextRunDate).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default RecurringManager
