import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Store reCAPTCHA verifier globally to prevent re-creation issues
let recaptchaVerifierInstance: RecaptchaVerifier | null = null;

/**
 * Setup invisible reCAPTCHA verifier on the 'recaptcha-container' div.
 * Reuses existing verifier if already created, or clears and recreates it.
 */
export function setupRecaptcha(): RecaptchaVerifier {
  // Clear existing verifier if present
  if (recaptchaVerifierInstance) {
    try {
      recaptchaVerifierInstance.clear();
    } catch {
      // ignore clear errors
    }
    recaptchaVerifierInstance = null;
  }

  recaptchaVerifierInstance = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved — will proceed with sendOtp
      console.log('[Firebase] reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('[Firebase] reCAPTCHA expired');
    },
  });

  return recaptchaVerifierInstance;
}

/**
 * Send OTP to phone number
 */
export async function sendOtp(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const formattedPhone = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+91${phoneNumber}`;
  
  console.log('[Firebase] Sending OTP to:', formattedPhone);
  return signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
}

/**
 * Verify OTP code
 */
export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  code: string
) {
  const result = await confirmationResult.confirm(code);
  return result.user;
}

/**
 * Get current user's ID token for API auth
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Sign out
 */
export async function signOut() {
  return auth.signOut();
}

export { auth };
