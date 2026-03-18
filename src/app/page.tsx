'use client'

import { useState } from 'react'
import { EventForm } from '@/components/EventForm'
import { saveRegistration } from '@/lib/firestore'
import type { FormData } from '@/types/form'
import Link from 'next/link'

export default function Home() {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(data: FormData) {
    setSubmitError(null)
    try {
      await saveRegistration(data)
      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {submitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-emerald-800">
              Registration submitted
            </h2>
            <p className="mt-2 text-emerald-700">
              Thank you for registering for Fun & Fitness Eve. We&apos;ll be in touch.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                Fun & Fitness Eve
              </h1>
              <p className="mt-1 text-slate-600">Date: 21-03-2026</p>
            </div>
            {submitError && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}
            <EventForm onSubmit={handleSubmit} />
            <div className="mt-6 text-center text-sm text-slate-600">
              <Link href="/login" className="font-medium text-sky-700 hover:text-sky-800">
                Admin login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
