import { useState } from 'react'
import { config } from '../config'

function PasswordProtection({ onAuthenticated }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Small delay for UX (simulating authentication)
    setTimeout(() => {
      const correctPassword = import.meta.env.VITE_APP_PASSWORD

      if (password === correctPassword) {
        localStorage.setItem(`${config.storagePrefix}authenticated`, 'true')
        onAuthenticated()
      } else {
        setError('Incorrect password. Please try again.')
        setPassword('')
      }

      setIsLoading(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {config.appTitle}
            </h1>
            {config.appSubtitle && (
              <p className="text-gray-600">
                {config.appSubtitle}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3"
            >
              {isLoading ? 'Verifying...' : 'Access App'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Password required to access task schedule</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordProtection
