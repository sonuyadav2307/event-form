import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

const REGISTRATIONS_COLLECTION = 'registrations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Validate required fields
    const required = [
      'fullName',
      'age',
      'gender',
      'mobile',
      'city',
      'emergencyName',
      'emergencyPhone',
      'medicalConditions',
      'consent',
    ]
    for (const key of required) {
      if (body[key] === undefined || body[key] === '') {
        return NextResponse.json(
          { error: `Missing or invalid: ${key}` },
          { status: 400 }
        )
      }
    }
    if (body.consent !== true) {
      return NextResponse.json(
        { error: 'Consent is required' },
        { status: 400 }
      )
    }

    const { reference } = body
    const docRef = await addDoc(collection(db, REGISTRATIONS_COLLECTION), {
      fullName: body.fullName,
      age: body.age,
      gender: body.gender,
      mobile: body.mobile,
      email: body.email ?? null,
      city: body.city,
      reference: reference ?? null,
      emergencyName: body.emergencyName,
      emergencyPhone: body.emergencyPhone,
      medicalConditions: body.medicalConditions,
      medicalDetails: body.medicalDetails ?? null,
      consent: body.consent,
      paymentStatus: 'unpaid',
      createdAt: serverTimestamp(),
    })

    return NextResponse.json({ success: true, id: docRef.id })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
