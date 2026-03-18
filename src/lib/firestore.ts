import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import type { FormData } from '@/types/form'

const REGISTRATIONS_COLLECTION = 'registrations'

export async function saveRegistration(data: FormData): Promise<string> {
  const docRef = await addDoc(collection(db, REGISTRATIONS_COLLECTION), {
    fullName: data.fullName,
    age: data.age,
    gender: data.gender,
    mobile: data.mobile,
    email: data.email || null,
    city: data.city,
    reference: data.reference || null,
    emergencyName: data.emergencyName,
    emergencyPhone: data.emergencyPhone,
    medicalConditions: data.medicalConditions,
    medicalDetails: data.medicalDetails || null,
    consent: data.consent,
    paymentStatus: 'unpaid',
    createdAt: serverTimestamp(),
  })
  return docRef.id
}
