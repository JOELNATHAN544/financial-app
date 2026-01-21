import React, { useState } from 'react'
import { FiClock, FiArrowLeft, FiDownload } from 'react-icons/fi'
import { api } from '../api'

const HistoryPage = ({ finalizationHistory, onBack }) => {
    const [downloading, setDownloading] = useState(false)

    const downloadSummary = async (summaryId) => {
        setDownloading(true)
        try {
            const response = await api.get(`/api/reports/monthly/${summaryId}/download`, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Monthly_Summary_${summaryId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
        } catch (error) {
            console.error('Failed to download summary', error)
            alert("Failed to download summary. Please try again.")
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in pb-24">
            <div className="flex items-center space-x-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-white text-slate-500 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 transition-all shadow-sm hover:shadow-md"
                >
                    <FiArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        History Archive
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Past month-end summaries and reports
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {finalizationHistory && finalizationHistory.length > 0 ? (
                    finalizationHistory.map((log) => (
                        <div
                            key={log.id}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-50 dark:bg-indigo-900/20 transition-transform group-hover:scale-150"></div>

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                        <FiClock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {new Date(log.finalizationDate).toLocaleDateString(undefined, {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Finalized on {new Date(log.finalizationDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Closing Balance
                                    </p>
                                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                        {log.totalBalanceAtFinalization?.toLocaleString()} XAF
                                    </p>
                                    <button
                                        onClick={() => downloadSummary(log.id)}
                                        disabled={downloading}
                                        className="mt-2 text-xs font-bold text-slate-400 hover:text-indigo-500 flex items-center justify-end gap-1 ml-auto transition-colors"
                                    >
                                        <FiDownload className="w-3 h-3" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 rounded-full bg-slate-100 p-6 dark:bg-slate-800">
                            <FiClock className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            No History Yet
                        </h3>
                        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                            Your month-end reports and finalized summaries will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HistoryPage
