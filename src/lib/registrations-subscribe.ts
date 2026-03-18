import {
  collection,
  onSnapshot,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/firebase'

const COLLECTION = 'registrations'

export type PaymentStatus = 'paid' | 'unpaid'

export type RegistrationRecord = {
  id: string
  paymentStatus: PaymentStatus
  fullName: string
  age: string
  gender: string
  mobile: string
  email: string | null
  city: string
  reference: string | null
  emergencyName: string
  emergencyPhone: string
  medicalConditions: string
  medicalDetails: string | null
  consent: boolean
  /** ms since epoch for sorting */
  createdAtMs: number
  createdAtLabel: string
}

function toCreatedAt(d: DocumentData): { ms: number; label: string } {
  const ts = d.createdAt
  if (ts && typeof ts.toDate === 'function') {
    const date = ts.toDate() as Date
    return {
      ms: date.getTime(),
      label: date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    }
  }
  return { ms: 0, label: '—' }
}

function mapPaymentStatus(d: DocumentData): PaymentStatus {
  return d.paymentStatus === 'paid' ? 'paid' : 'unpaid'
}

function mapDoc(id: string, d: DocumentData): RegistrationRecord {
  const { ms, label } = toCreatedAt(d)
  return {
    id,
    paymentStatus: mapPaymentStatus(d),
    fullName: String(d.fullName ?? ''),
    age: String(d.age ?? ''),
    gender: String(d.gender ?? ''),
    mobile: String(d.mobile ?? ''),
    email: d.email != null ? String(d.email) : null,
    city: String(d.city ?? ''),
    reference: d.reference != null ? String(d.reference) : null,
    emergencyName: String(d.emergencyName ?? ''),
    emergencyPhone: String(d.emergencyPhone ?? ''),
    medicalConditions: String(d.medicalConditions ?? ''),
    medicalDetails:
      d.medicalDetails != null ? String(d.medicalDetails) : null,
    consent: Boolean(d.consent),
    createdAtMs: ms,
    createdAtLabel: label,
  }
}

/**
 * Live listener for all registration documents (newest first).
 * Deploy rules: authenticated users may read `registrations`.
 */
export function subscribeRegistrations(
  onData: (rows: RegistrationRecord[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const rows = snap.docs
        .map((doc) => mapDoc(doc.id, doc.data()))
        .sort((a, b) => b.createdAtMs - a.createdAtMs)
      onData(rows)
    },
    (err) => {
      onError(err.message || 'Failed to load registrations.')
    }
  )
}
