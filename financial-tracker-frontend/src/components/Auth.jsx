import React, { useState } from 'react'
import { api, API_BASE_URL } from '../api'
import { HiEye, HiEyeOff, HiArrowLeft } from 'react-icons/hi'

function Auth({ onLogin, onBack, initialMode = 'login' }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(initialMode === 'login')

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')

    if (!isLogin && !isVerifying) {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
      if (!emailRegex.test(email)) {
        setError('Invalid email format')
        return
      }

      const passwordRegex =
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>\\-_=+[\]\\/~`|;:'"]).{8,}$/
      if (!passwordRegex.test(password)) {
        setError(
          'Password must be at least 8 characters long and contain a combination of letters, numbers, and special characters.'
        )
        return
      }
    }

    try {
      if (isVerifying) {
        // Verify Email Flow
        await api.post('/api/auth/verify-email', { username, code: verificationCode })
        setIsVerifying(false)
        setIsLogin(true)
        setVerificationCode('')
        setError('')
        alert('Email verified! Please sign in.')
        return
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin
        ? { username, password }
        : { username, email, password }

      const data = await api.post(endpoint, payload)

      if (isLogin) {
        const token = data.jwt
        const refreshToken = data.refreshToken
        localStorage.setItem('jwtToken', token)
        localStorage.setItem('refreshToken', refreshToken)
        onLogin(token)
      } else {
        // Registration success -> Move to verification
        setIsVerifying(true)
        setError('')
      }
    } catch (err) {
      setError(err.message)
      console.error(isLogin ? 'Login error:' : 'Registration error:', err)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] p-6">
      {/* Dynamic Background Elements */}
      <div className="absolute -left-4 top-0 h-72 w-72 animate-pulse rounded-full bg-indigo-500/10 blur-[120px]"></div>
      <div className="absolute -right-4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-[120px] delay-700"></div>

      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-6 top-6 z-20 flex items-center space-x-2 rounded-full bg-slate-800/50 px-4 py-2 text-sm font-bold text-slate-400 backdrop-blur-md transition-all hover:bg-slate-700/50 hover:text-white"
        >
          <HiArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      )}

      <div className="animate-premium-fade z-10 w-full max-w-md">
        <div className="glass-card relative border-none p-10 shadow-2xl">
          <div className="premium-gradient absolute left-0 top-0 h-1.5 w-full"></div>

          <div className="mb-10 text-center">
            <div className="premium-gradient group mx-auto mb-6 flex h-16 w-16 rotate-12 transform items-center justify-center rounded-3xl shadow-2xl shadow-indigo-500/20">
              <span className="text-3xl font-black text-white">$</span>
            </div>
            <h2 className="dark:text-white text-4xl font-black tracking-tight text-slate-900">
              {isVerifying ? 'Verify Email' : isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="dark:text-slate-400 mt-2 font-medium text-slate-500">
              {isVerifying
                ? 'Enter the code sent to your email'
                : isLogin
                  ? 'Manage your finances with elegance'
                  : 'Start your journey to financial freedom'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {!isVerifying ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="dark:text-slate-300 ml-1 block text-sm font-bold text-slate-700">
                    {isLogin ? 'Username or Email' : 'Username'}
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder={
                      isLogin ? 'Enter username or email' : 'Choose a username'
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="dark:text-slate-300 ml-1 block text-sm font-bold text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      className="input-field"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="dark:text-slate-300 ml-1 block text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="input-field pr-12"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-indigo-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <HiEyeOff size={20} />
                      ) : (
                        <HiEye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="dark:text-slate-300 ml-1 block text-sm font-bold text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        className="input-field pr-12"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-indigo-500"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <HiEyeOff size={20} />
                        ) : (
                          <HiEye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="dark:text-slate-300 ml-1 block text-sm font-bold text-slate-700">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="dark:text-rose-400 animate-pulse rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="interactive-button premium-gradient w-full py-3.5 text-lg shadow-xl shadow-indigo-500/20"
            >
              {isVerifying ? 'Verify Account' : isLogin ? 'Sign In' : 'Get Started'}
            </button>
          </form>

          {!isVerifying && (
            <>
              <div className="mt-8">
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="dark:border-slate-800 w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                    <span className="dark:bg-[#0f172a] bg-white px-4 text-slate-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    (window.location.href = `${API_BASE_URL}/oauth2/authorization/google`)
                  }
                  className="interactive-button dark:bg-slate-900 dark:border-slate-800 mt-4 flex w-full items-center justify-center space-x-3 border border-slate-200 bg-white hover:border-indigo-500/50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span className="dark:text-slate-300 font-bold text-slate-700">
                    Log in with Google
                  </span>
                </button>
              </div>

              <div className="mt-8 pt-2 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setUsername('')
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')
                    setShowPassword(false)
                    setShowConfirmPassword(false)
                  }}
                  className="text-sm font-bold tracking-tight text-indigo-500 transition-colors hover:text-indigo-600"
                >
                  {isLogin
                    ? "Don't have an account? Create one"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth
