'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '@/firebase'
import { updateRegistrationPaymentStatus } from '@/lib/registration-payment'
import {
  subscribeRegistrations,
  type PaymentStatus,
  type RegistrationRecord,
} from '@/lib/registrations-subscribe'

function PaymentToggle({
  row,
  busy,
  onSetStatus,
}: {
  row: RegistrationRecord
  busy: boolean
  onSetStatus: (id: string, status: PaymentStatus) => void
}) {
  const paid = row.paymentStatus === 'paid'
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      <button
        type="button"
        disabled={busy || !paid}
        onClick={() => onSetStatus(row.id, 'unpaid')}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
          !paid
            ? 'bg-slate-800 text-white shadow-sm'
            : 'text-slate-600 hover:bg-white'
        } ${busy ? 'cursor-wait opacity-60' : ''}`}
      >
        Unpaid
      </button>
      <button
        type="button"
        disabled={busy || paid}
        onClick={() => onSetStatus(row.id, 'paid')}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
          paid
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-white'
        } ${busy ? 'cursor-wait opacity-60' : ''}`}
      >
        Paid
      </button>
    </div>
  )
}

const cellClass =
  'border-b border-slate-200 px-3 py-2.5 text-left text-sm text-slate-800 align-top'
const thClass =
  'sticky top-0 z-10 border-b border-slate-300 bg-slate-100 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [rows, setRows] = useState<RegistrationRecord[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const name = (r.fullName || '').toLowerCase()
      const email = (r.email || '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [rows, searchQuery])

  useEffect(() => {
    if (!auth) {
      router.replace('/login')
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser) {
        router.replace('/login')
        return
      }
      setUser(nextUser)
      setChecking(false)
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (!user) return
    setLoadState('loading')
    setLoadError(null)
    const unsub = subscribeRegistrations(
      (data) => {
        setRows(data)
        setLoadState('ready')
      },
      (msg) => {
        setLoadError(msg)
        setLoadState('error')
      }
    )
    return () => unsub()
  }, [user])

  const handlePaymentStatus = useCallback(
    async (id: string, status: PaymentStatus) => {
      setPaymentError(null)
      setUpdatingId(id)
      try {
        await updateRegistrationPaymentStatus(id, status)
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : 'Could not update payment status.'
        setPaymentError(msg)
      } finally {
        setUpdatingId(null)
      }
    },
    []
  )

  async function handleSignOut() {
    if (!auth) return
    setSigningOut(true)
    try {
      await signOut(auth)
      router.replace('/login')
    } finally {
      setSigningOut(false)
    }
  }

  if (checking || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          <p className="text-sm text-slate-600">Verifying session…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[100vw] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600">
              Signed in as{' '}
              <span className="font-medium text-slate-800">{user.email}</span>
              {loadState === 'ready' && rows.length > 0 && (
                <span className="ml-2 text-slate-500">
                  ·{' '}
                  {searchQuery.trim()
                    ? `${filteredRows.length} of ${rows.length} shown`
                    : `${rows.length} registration${rows.length !== 1 ? 's' : ''}`}
                </span>
              )}
              {loadState === 'ready' && rows.length === 0 && (
                <span className="ml-2 text-slate-500">· 0 registrations</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Event form
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:opacity-60"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[100vw] px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Registrations
            </h2>
            <p className="text-sm text-slate-600">
              Table view · live updates · filter by name or email
            </p>
          </div>
          {loadState === 'ready' && rows.length > 0 && (
            <div className="w-full sm:max-w-sm">
              <label htmlFor="reg-search" className="sr-only">
                Search by name or email
              </label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  id="reg-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  autoComplete="off"
                />
                {searchQuery.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {paymentError && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {paymentError}
          </div>
        )}

        {loadState === 'loading' && (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
              <p className="text-sm text-slate-600">Loading registrations…</p>
            </div>
          </div>
        )}

        {loadState === 'error' && loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
            <p className="font-medium">Could not load registrations</p>
            <p className="mt-2 text-red-700">{loadError}</p>
            <p className="mt-3 text-xs text-red-600">
              Deploy updated Firestore rules (read + payment-only update for
              admins).
            </p>
          </div>
        )}

        {loadState === 'ready' && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 py-16 text-center">
            <p className="text-slate-600">No registrations yet.</p>
            <Link
              href="/"
              className="mt-2 inline-block text-sm font-medium text-sky-700 hover:underline"
            >
              Open event form
            </Link>
          </div>
        )}

        {loadState === 'ready' && rows.length > 0 && filteredRows.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-slate-700">
              No registrations match{' '}
              <span className="font-medium text-slate-900">
                &ldquo;{searchQuery.trim()}&rdquo;
              </span>
              .
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm font-medium text-sky-700 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {loadState === 'ready' && rows.length > 0 && filteredRows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-[1100px] w-full border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Submitted</th>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Mobile</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Age</th>
                  <th className={thClass}>Gender</th>
                  <th className={thClass}>City</th>
                  <th className={thClass}>Reference</th>
                  <th className={thClass}>Emergency</th>
                  <th className={thClass}>Medical</th>
                  <th className={thClass}>Consent</th>
                  <th className={`${thClass} whitespace-nowrap`}>
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const medical =
                    row.medicalConditions === 'yes' && row.medicalDetails
                      ? `Yes — ${row.medicalDetails}`
                      : row.medicalConditions === 'yes'
                        ? 'Yes'
                        : 'No'
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className={`${cellClass} whitespace-nowrap text-slate-600`}>
                        {row.createdAtLabel}
                      </td>
                      <td className={`${cellClass} font-medium`}>
                        {row.fullName || '—'}
                      </td>
                      <td className={cellClass}>{row.mobile || '—'}</td>
                      <td className={`${cellClass} max-w-[140px] truncate`} title={row.email ?? ''}>
                        {row.email || '—'}
                      </td>
                      <td className={cellClass}>{row.age || '—'}</td>
                      <td className={cellClass}>{row.gender || '—'}</td>
                      <td className={cellClass}>{row.city || '—'}</td>
                      <td className={`${cellClass} max-w-[120px] truncate`} title={row.reference ?? ''}>
                        {row.reference || '—'}
                      </td>
                      <td className={`${cellClass} max-w-[160px] text-xs`}>
                        <div>{row.emergencyName || '—'}</div>
                        <div className="text-slate-600">{row.emergencyPhone || ''}</div>
                      </td>
                      <td className={`${cellClass} max-w-[140px] text-xs`} title={medical}>
                        {medical}
                      </td>
                      <td className={cellClass}>
                        {row.consent ? (
                          <span className="text-emerald-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </td>
                      <td className={`${cellClass} whitespace-nowrap`}>
                        <PaymentToggle
                          row={row}
                          busy={updatingId === row.id}
                          onSetStatus={handlePaymentStatus}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
