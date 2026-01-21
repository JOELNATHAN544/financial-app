import React from 'react'

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 animate-scale-in">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {message}
                    </p>
                </div>
                <div className="flex items-center justify-end space-x-3 bg-slate-50 px-6 py-4 dark:bg-slate-800/50">
                    <button
                        onClick={onCancel}
                        className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 hover:text-slate-700"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${isDangerous
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                                : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal
