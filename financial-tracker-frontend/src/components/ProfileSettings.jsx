import React, { useState, useEffect } from 'react'
import { api } from '../api'

const ProfileSettings = ({ user, onUpdate, onDelete, onCancel }) => {
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const updates = {}
      if (username !== user.username) updates.username = username
      if (email !== user.email) updates.email = email
      if (password) updates.password = password

      if (Object.keys(updates).length === 0) {
        setMessage('No changes to update.')
        return
      }

      await api.put('/api/users/me', updates)
      setMessage('Profile updated successfully!')
      onUpdate()
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    }
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      try {
        await api.delete('/api/users/me')
        onDelete()
      } catch (err) {
        setError('Failed to delete account.')
      }
    }
  }

  return (
    <div className="glass-card animate-premium-fade relative mx-auto mt-10 max-w-xl overflow-hidden p-10">
      <div className="premium-gradient absolute left-0 top-0 h-2 w-full"></div>

      <div className="mb-10 flex items-center justify-between">
        <h2 className="dark:text-white text-3xl font-black tracking-tight text-slate-900">
          Account Settings
        </h2>
        <div className="dark:bg-slate-800 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      {message && (
        <div className="dark:text-emerald-400 mb-6 flex items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-600">
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {message}
        </div>
      )}
      {error && (
        <div className="dark:text-rose-400 mb-6 flex items-center rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-bold text-rose-600">
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="space-y-2">
          <label className="dark:text-slate-300 ml-1 block text-sm font-bold text-slate-700">
            Username
          </label>
          <input
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
          />
        </div>
        <div className="space-y-2">
          <label className="dark:text-slate-300 ml-1 block text-sm font-bold text-slate-700">
            Email
          </label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>
        <div className="space-y-2">
          <label className="dark:text-slate-300 ml-1 block flex justify-between text-sm font-bold text-slate-700">
            <span>New Password</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              Leave blank to keep current
            </span>
          </label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            className="interactive-button premium-gradient flex-1 shadow-indigo-500/20"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 flex-1 rounded-xl bg-slate-100 px-6 py-2.5 font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="dark:border-slate-800 mt-12 flex flex-col items-center border-t border-slate-100 pt-8">
        <button
          onClick={handleDelete}
          className="text-sm font-bold uppercase tracking-tight text-rose-500 transition-all duration-300 hover:text-rose-600 hover:underline"
        >
          Permanently Delete Account
        </button>
        <p className="mt-2 text-[10px] text-slate-400">
          This action is irreversible and will delete all your financial data.
        </p>
      </div>
    </div>
  )
}

export default ProfileSettings
