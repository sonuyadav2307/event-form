import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export async function deleteRegistration(registrationId: string): Promise<void> {
  await deleteDoc(doc(db, 'registrations', registrationId))
}

