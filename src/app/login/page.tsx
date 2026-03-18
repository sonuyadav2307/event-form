'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'
import { mapAuthError } from '@/lib/auth-errors'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !auth) {
      setAuthReady(true)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard')
      }
      setAuthReady(true)
    })
    return () => unsubscribe()
  }, [router])

  const canSubmit = useMemo(() => {
    return (
      isValidEmail(email) &&
      password.trim().length >= 6 &&
      !busy &&
      authReady &&
      !!auth
    )
  }, [email, password, busy, authReady])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!auth) {
      setError('Authentication is unavailable. Refresh the page.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.replace('/dashboard')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
        <p className="text-sm text-slate-600">Loading…</p>
      </main>
    )
  }

  if (!auth) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
          Sign-in must run in the browser. Open this page from a normal tab, not
          a preview that blocks JavaScript.
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                d="M12 14.5c2.761 0 5-2.239 5-5S14.761 4.5 12 4.5 7 6.739 7 9.5s2.239 5 5 5Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M4.5 20.25c1.86-3.38 4.86-5.25 7.5-5.25s5.64 1.87 7.5 5.25"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin login</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to manage registrations and event settings.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="admin@company.com"
                required
              />
            </label>

            <label className="block">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">
                  Password
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-sm font-medium text-sky-700 hover:text-sky-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <p className="mt-2 text-xs text-slate-500">
                Use the password for your Firebase Auth account (min. 6
                characters).
              </p>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="text-center text-sm text-slate-600">
              <Link
                href="/"
                className="font-medium text-sky-700 hover:text-sky-800"
              >
                Back to event form
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Protected area for event administrators.
        </p>
      </div>
    </main>
  )
}
