import type { FirebaseError } from 'firebase/app'

export function mapAuthError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as FirebaseError).code
    switch (code) {
      case 'auth/invalid-email':
        return 'That email address is not valid.'
      case 'auth/user-disabled':
        return 'This account has been disabled.'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.'
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.'
      default:
        return 'Sign-in failed. Please try again.'
    }
  }
  return 'Something went wrong. Please try again.'
}
