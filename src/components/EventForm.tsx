'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { FormData } from '@/types/form'
import logo from "@/assets/logo.png"
import paymentQR from "@/assets/paymentQR.jpeg"

type Props = {
  onSubmit: (data: FormData, paymentScreenshotDataUrl?: string | null) => Promise<void>
}

export function EventForm({ onSubmit }: Props) {
  const [loading, setLoading] = useState(false)
  const [paymentScreenshotDataUrl, setPaymentScreenshotDataUrl] = useState<
    string | null
  >(null)
  const [paymentScreenshotError, setPaymentScreenshotError] = useState<
    string | null
  >(null)
  const [form, setForm] = useState<FormData>({
    fullName: '',
    age: '',
    gender: '',
    mobile: '',
    email: '',
    city: 'Vadodara',
    reference: '',
    emergencyName: '',
    emergencyPhone: '',
    medicalConditions: 'no',
    medicalDetails: '',
    consent: false,
  })

  function update(f: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...f }))
  }

  async function setScreenshot(file: File | null) {
    // Firestore document limit is ~1MiB; base64 expands size ~33%.
    // Keep the raw file small so the resulting data URL stays safely under limit.
    const MAX_BYTES = 600 * 1024

    if (!file) {
      setPaymentScreenshotDataUrl(null)
      setPaymentScreenshotError(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      setPaymentScreenshotDataUrl(null)
      setPaymentScreenshotError('Please upload an image file.')
      return
    }

    if (file.size > MAX_BYTES) {
      setPaymentScreenshotDataUrl(null)
      setPaymentScreenshotError('Image must be 600KB or less.')
      return
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.onload = () => resolve(String(reader.result || ''))
      reader.readAsDataURL(file)
    })

    if (!dataUrl.startsWith('data:image/')) {
      setPaymentScreenshotDataUrl(null)
      setPaymentScreenshotError('Invalid image format.')
      return
    }

    setPaymentScreenshotDataUrl(dataUrl)
    setPaymentScreenshotError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.consent) return
    if (!form.fullName.trim() || !form.mobile.trim()) return
    if (paymentScreenshotError) return
    setLoading(true)
    await onSubmit(form, paymentScreenshotDataUrl)
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex justify-center">
        <Image
          src={logo}
          alt="Event A MANIA"
          width={240}
          height={120}
          className="h-auto w-full max-w-[240px] object-contain"
          priority
        />
      </div>

      {/* 2. Participant Details */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Participant Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Full Name <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => update({ fullName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Your full name"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Age
            </span>
            <input
              type="number"
              required
              min={1}
              max={120}
              value={form.age}
              onChange={(e) => update({ age: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Age"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Gender
            </span>
            <select
              required
              value={form.gender}
              onChange={(e) => update({ gender: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Mobile Number <span className="text-red-600">*</span>
            </span>
            <input
              type="tel"
              required
              value={form.mobile}
              onChange={(e) => update({ mobile: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Mobile number"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Email <span className="text-slate-500">(Optional)</span>
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Email"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              City
            </span>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => update({ city: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="City"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Reference <span className="text-slate-500">(Optional)</span>
            </span>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => update({ reference: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="How did you hear about this event?"
            />
          </label>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 3. Emergency Contact */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Emergency Contact
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Emergency Contact Name
            </span>
            <input
              type="text"
              required
              value={form.emergencyName}
              onChange={(e) => update({ emergencyName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Name"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Emergency Phone Number
            </span>
            <input
              type="tel"
              required
              value={form.emergencyPhone}
              onChange={(e) => update({ emergencyPhone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Phone number"
            />
          </label>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 4. Health Declaration */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Health Declaration
        </h2>
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Do you have any medical conditions?
          </span>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="medical"
                checked={form.medicalConditions === 'no'}
                onChange={() => update({ medicalConditions: 'no', medicalDetails: '' })}
                className="h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-slate-700">No</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="medical"
                checked={form.medicalConditions === 'yes'}
                onChange={() => update({ medicalConditions: 'yes' })}
                className="h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-slate-700">Yes (Please specify)</span>
            </label>
          </div>
          {form.medicalConditions === 'yes' && (
            <label className="mt-3 block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                If yes:
              </span>
              <input
                type="text"
                value={form.medicalDetails}
                onChange={(e) => update({ medicalDetails: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Specify medical conditions"
              />
            </label>
          )}
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 7. Consent / Declaration */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Consent / Declaration
        </h2>
        <blockquote className="rounded-lg border-l-4 border-slate-300 bg-slate-50 py-2 pl-4 pr-3 text-slate-700">
          &ldquo;I confirm that I am medically fit to participate in this event
          and I take full responsibility for my participation.&rdquo;
        </blockquote>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            required
            checked={form.consent}
            onChange={(e) => update({ consent: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span className="text-sm font-medium text-slate-700">I Agree</span>
        </label>
      </section>

      <hr className="border-slate-200" />

      {/* Payment */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Payment</h2>
        <p className="text-sm text-slate-600">
          Scan the QR to pay. After payment, please enter your UPI/transaction reference in the
          “Reference” field (optional but recommended).
        </p>
        <div className="flex justify-center">
          <a
            href={paymentQR.src}
            target="_blank"
            rel="noreferrer"
            className="block w-full max-w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-white"
            aria-label="Open payment QR in new tab"
          >
            <Image
              src={paymentQR}
              alt="Payment QR code"
              className="h-auto w-full object-contain"
              priority={false}
            />
          </a>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Upload payment screenshot <span className="text-slate-500">(Optional)</span>
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void setScreenshot(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          {paymentScreenshotDataUrl && !paymentScreenshotError && (
            <p className="mt-1 text-xs text-slate-500">Screenshot attached.</p>
          )}
          {paymentScreenshotError && (
            <p className="mt-1 text-xs text-red-600">{paymentScreenshotError}</p>
          )}
        </label>
        <p className="text-xs text-slate-500">Tip: Tap the QR to open and zoom.</p>
      </section>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !form.consent || !form.fullName.trim() || !form.mobile.trim()}
          className="w-full rounded-lg bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit Registration'}
        </button>
      </div>
    </form>
  )
}
