import React from 'react'
import { FiPieChart, FiShield, FiTrendingUp, FiSmartphone } from 'react-icons/fi'

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px] animate-pulse delay-1000"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20">
                        <span className="text-xl font-black text-white">$</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        FinanceFlow
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onLoginClick}
                        className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                        Log in
                    </button>
                    <button
                        onClick={onRegisterClick}
                        className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors shadow-lg shadow-white/10"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-40 text-center animate-fade-in">
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
                        Master your money with <br />
                        <span className="text-indigo-400">intelligent insights.</span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-slate-400">
                        Stop guessing where your money goes. FinanceFlow brings AI-powered tracking, smart budgeting, and comprehensive analytics to your fingertips in a beautiful, secure interface.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <button
                            onClick={onRegisterClick}
                            className="group relative rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
                        >
                            Start for free
                            <div className="absolute inset-0 rounded-full bg-white/20 blur-md transition-opacity opacity-0 group-hover:opacity-100"></div>
                        </button>
                        <button
                            onClick={onLoginClick}
                            className="text-sm font-semibold leading-6 text-white hover:text-indigo-300 transition-colors flex items-center gap-2"
                        >
                            Sign in <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-32">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <FeatureCard
                        icon={FiPieChart}
                        title="Smart Analytics"
                        desc="Visualise your spending patterns with beautiful, interactive charts."
                    />
                    <FeatureCard
                        icon={FiTrendingUp}
                        title="AI Insights"
                        desc="Get personalized recommendations to optimize your savings."
                    />
                    <FeatureCard
                        icon={FiShield}
                        title="Bank-Grade Security"
                        desc="Your data is encrypted and protected with industry standards."
                    />
                    <FeatureCard
                        icon={FiSmartphone}
                        title="Multi-Platform"
                        desc="Access your financial data securely from any device, anywhere."
                    />
                </div>
            </div>

        </div>
    )
}

const FeatureCard = ({ icon, title, desc }) => {
    const Icon = icon
    return (
        <div className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 transition-all hover:bg-white/10 hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
        </div>
    )
}

export default LandingPage
