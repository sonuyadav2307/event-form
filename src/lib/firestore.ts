import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, storage } from '@/firebase'
import type { FormData } from '@/types/form'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

const REGISTRATIONS_COLLECTION = 'registrations'
const MAX_PAYMENT_SCREENSHOT_BYTES = 2 * 1024 * 1024

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120)
}

export async function saveRegistration(
  data: FormData,
  paymentScreenshot?: File | null
): Promise<string> {
  let paymentScreenshotUrl: string | null = null
  let paymentScreenshotPath: string | null = null

  if (paymentScreenshot) {
    if (paymentScreenshot.size > MAX_PAYMENT_SCREENSHOT_BYTES) {
      throw new Error('Payment screenshot must be 2MB or less.')
    }
    if (!storage) {
      throw new Error('Storage is not available in this environment.')
    }
    const key = `${Date.now()}-${safeFileName(paymentScreenshot.name || 'payment.png')}`
    paymentScreenshotPath = `paymentScreenshots/${key}`
    const storageRef = ref(storage, paymentScreenshotPath)
    await uploadBytes(storageRef, paymentScreenshot)
    paymentScreenshotUrl = await getDownloadURL(storageRef)
  }

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
    paymentScreenshotUrl,
    paymentScreenshotPath,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}
