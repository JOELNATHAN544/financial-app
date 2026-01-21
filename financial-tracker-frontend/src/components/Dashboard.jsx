import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6'];

const Dashboard = ({ onBack }) => {
    const [categoryData, setCategoryData] = useState([]);
    // trendData removed as it was unused
    const [budgets, setBudgets] = useState([]);
    const [advisorData, setAdvisorData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [categories, budgetData, advisor] = await Promise.all([
                    api.get('/api/reports/expense-by-category'),
                    api.get('/api/budgets/current'),
                    api.get('/api/advisor/insights')
                ]);
                if (isMounted) {
                    setCategoryData(categories);
                    setBudgets(budgetData);
                    setAdvisorData(advisor);
                }
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
            <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Analyzing your finances...</div>
        </div>
    );

    return (
        <div className="space-y-8 animate-premium-fade">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Financial Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time insights and AI forecasting</p>
                </div>
                <button onClick={onBack} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95">
                    Return to Transactions
                </button>
            </div>

            {/* AI Summary Cards */}
            {advisorData && advisorData.stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 border-l-4 border-indigo-500">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Projected End Balance</p>
                        <h4 className="text-2xl font-black dark:text-white">
                            {advisorData.stats.projectedEndOfMonthBalance?.toLocaleString() ?? '0'} <span className="text-sm font-normal text-slate-400">FCFA</span>
                        </h4>
                        <div className="mt-2 text-[10px] font-bold text-indigo-400">Based on 60-day historical trend</div>
                    </div>
                    <div className="glass-card p-6 border-l-4 border-purple-500">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Daily Burn Rate</p>
                        <h4 className="text-2xl font-black dark:text-white">
                            {advisorData.stats.averageDailySpending?.toLocaleString() ?? '0'} <span className="text-sm font-normal text-slate-400">FCFA/day</span>
                        </h4>
                        <div className="mt-2 text-[10px] font-bold text-purple-400">Average over the last 30 days</div>
                    </div>
                    <div className="glass-card p-6 border-l-4 border-emerald-500">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Financial Health</p>
                        <h4 className={`text-2xl font-black ${advisorData.stats.spendingTrend === 'DOWN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {advisorData.stats.spendingTrend === 'DOWN' ? 'Improving' : advisorData.stats.spendingTrend === 'UP' ? 'Warning' : 'Stable'}
                        </h4>
                        <div className="mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Current month velocity</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Forecasting Chart */}
                <div className="glass-card p-6 lg:col-span-2 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Balance Forecast</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500"></span><span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">History</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500" style={{ opacity: 0.3 }}></span><span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">30-Day Projection</span></div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={advisorData?.balanceForecast || []}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="glass-card p-3 border-none shadow-2xl">
                                                    <p className="text-[10px] uppercase font-black text-slate-500 mb-1">{new Date(data.date).toLocaleDateString()}</p>
                                                    <p className="text-sm font-black text-indigo-500">
                                                        {data.balance?.toLocaleString() ?? '0'} FCFA
                                                        {data.projected && <span className="ml-2 py-0.5 px-1.5 bg-indigo-500/10 rounded text-[8px]">PROJECTED</span>}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorBalance)"
                                    strokeDasharray={advisorData?.balanceForecast?.some(d => d.projected) ? "5 5" : "0"}
                                    connectNulls
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Advice Cards */}
                <div className="glass-card p-6 flex flex-col">
                    <h3 className="text-xl font-bold mb-6 text-slate-700 dark:text-slate-200">Smart Advisor</h3>
                    <div className="space-y-4 flex-1">
                        {advisorData?.advice?.map((tip, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.01]">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${tip.includes('Warning') ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500'}`}>
                                    {tip.includes('Warning') ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    )}
                                </div>
                                <p className="text-sm font-medium leading-relaxed self-center">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown (Existing) */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6 text-slate-700 dark:text-slate-200">Expenses by Category</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    cornerRadius={8}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="glass-card p-3 border-none shadow-2xl">
                                                    <p className="text-[10px] uppercase font-black text-slate-500 mb-1">{data.name}</p>
                                                    <p className="text-sm font-black text-indigo-500">
                                                        {data.value?.toLocaleString() ?? '0'} FCFA
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Budget Progress (Existing) */}
            {budgets.length > 0 && (
                <div className="glass-card p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-6xl rotate-12">📊</div>
                    <h3 className="text-xl font-bold mb-6 text-slate-700 dark:text-slate-200">Monthly Budget Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {budgets.map(b => (
                            <div key={b.category} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-slate-900 dark:text-white tracking-tight">{b.category}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${b.percent > 100 ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                        {b.percent}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${b.percent > 100 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(b.percent, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
                                    <span>{b.actual.toLocaleString()} FCFA</span>
                                    <span>LIMIT: {b.budgeted.toLocaleString()} FCFA</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
