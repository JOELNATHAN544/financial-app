import React, { useState } from 'react'
import { api } from '../api'

const Settings = ({ user, onUpdate, onDelete, onCancel, theme, toggleTheme, onLogout }) => {
    const [activeTab, setActiveTab] = useState('profile') // profile, security, preferences

    // Profile State
    const [username, setUsername] = useState(user?.username || '')
    const [email, setEmail] = useState(user?.email || '')

    // Security State
    const [password, setPassword] = useState('')
    const [currentPassword, setCurrentPassword] = useState('') // For password change verification if needed, or just new password. simpler to just allow update like ProfileSettings did.
    const [isDeleting, setIsDeleting] = useState(false)
    const [deletionStep, setDeletionStep] = useState('initial') // initial, verifying
    const [deletionCode, setDeletionCode] = useState('')
    const [deletionPassword, setDeletionPassword] = useState('')

    // UI State
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setMessage('')
        setError('')
        try {
            const updates = {}
            if (username !== user.username) updates.username = username
            if (email !== user.email) updates.email = email

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

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setMessage('')
        setError('')
        try {
            if (!password) return;
            await api.put('/api/users/me', { password }) // Assuming this endpoint handles password update
            setPassword('')
            setMessage('Password updated successfully!')
        } catch (err) {
            setError(err.message || 'Failed to update password.')
        }
    }

    const initiateDeletion = async () => {
        try {
            await api.post('/api/auth/request-deletion', { username: user.username })
            setDeletionStep('verifying')
            setMessage('Verification code sent to your email.')
        } catch (err) {
            setError(err.message || 'Failed to request deletion.')
        }
    }

    const confirmDeletion = async () => {
        try {
            await api.post('/api/auth/delete-account', {
                username: user.username,
                password: deletionPassword,
                code: deletionCode
            })
            onDelete() // Logs out with message
        } catch (err) {
            setError(err.message || 'Failed to delete account.')
        }
    }

    return (
        <div className="glass-card animate-premium-fade mx-auto mt-10 max-w-4xl overflow-hidden p-0">
            <div className="flex h-full min-h-[600px]">
                {/* Sidebar */}
                <div className="w-64 border-r border-slate-200/50 bg-slate-50/50 p-6 dark:border-slate-800/50 dark:bg-slate-900/50">
                    <h2 className="mb-8 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Settings</h2>
                    <nav className="space-y-2">
                        {[
                            { id: 'profile', label: 'Profile', icon: 'User' },
                            { id: 'security', label: 'Security', icon: 'Shield' },
                            { id: 'preferences', label: 'Preferences', icon: 'Sliders' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? 'premium-gradient text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto pt-8">
                        <button
                            onClick={onCancel}
                            className="mb-4 w-full rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-10 bg-white/50 dark:bg-slate-950/20">
                    {message && (
                        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-bold text-rose-600 dark:text-rose-400">
                            {error}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Username</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="interactive-button premium-gradient px-8 py-3">
                                    Save Profile
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-12 animate-fade-in">
                            <div>
                                <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Change Password</h3>
                                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button type="submit" className="interactive-button bg-slate-900 text-white dark:bg-slate-700 px-8 py-3 hover:bg-slate-800">
                                        Update Password
                                    </button>
                                </form>
                            </div>

                            <div className="border-t border-slate-200 pt-8 dark:border-slate-800">
                                <h3 className="mb-2 text-xl font-bold text-rose-600">Danger Zone</h3>
                                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                                    Deletion is irreversible. You will verify this action via email.
                                </p>

                                {deletionStep === 'initial' ? (
                                    <button
                                        onClick={initiateDeletion}
                                        className="rounded-xl border border-rose-500/30 bg-rose-50 text-rose-600 px-6 py-3 font-bold transition-all hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20"
                                    >
                                        Delete Account
                                    </button>
                                ) : (
                                    <div className="space-y-4 max-w-md bg-rose-50 p-6 rounded-xl dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50">
                                        <h4 className="font-bold text-rose-700 dark:text-rose-400">Verify Deletion</h4>
                                        <input
                                            type="password"
                                            placeholder="Your Password"
                                            className="input-field bg-white"
                                            value={deletionPassword}
                                            onChange={e => setDeletionPassword(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Verification Code (from email)"
                                            className="input-field bg-white"
                                            value={deletionCode}
                                            onChange={e => setDeletionCode(e.target.value)}
                                        />
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={confirmDeletion}
                                                className="flex-1 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700"
                                            >
                                                Confirm Delete
                                            </button>
                                            <button
                                                onClick={() => setDeletionStep('initial')}
                                                className="flex-1 rounded-xl bg-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Preferences</h3>

                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Theme Mode</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`p-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                                >
                                    {theme === 'dark' ? 'Dark Mode On' : 'Light Mode On'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Session</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Log out of your account on this device</p>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="px-6 py-3 rounded-xl bg-rose-100 text-rose-600 font-bold hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default Settings
