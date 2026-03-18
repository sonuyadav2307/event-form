import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export type PaymentStatus = 'paid' | 'unpaid'

export async function updateRegistrationPaymentStatus(
  registrationId: string,
  paymentStatus: PaymentStatus
): Promise<void> {
  await updateDoc(doc(db, 'registrations', registrationId), {
    paymentStatus,
  })
}
