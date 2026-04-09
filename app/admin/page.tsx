'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  signInWithPopup, GoogleAuthProvider,
  signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

declare global {
  interface Window { recaptchaVerifier?: RecaptchaVerifier }
}

export default function AdminPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('+47')
  const [otp, setOtp] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const router = useRouter()

  async function exchangeToken(idToken: string): Promise<boolean> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    return res.ok
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider())
      const idToken = await result.user.getIdToken()
      if (await exchangeToken(idToken)) {
        router.push('/personal')
      } else {
        await auth.signOut()
        setError('Access denied. This Google account is not authorised.')
        setLoading(false)
      }
    } catch {
      setError('Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  async function handleSendCode() {
    setLoading(true)
    setError('')
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      }
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier)
      setConfirmation(result)
    } catch (err) {
      console.error('Phone sign-in error:', err)
      setError('Failed to send code. Check the number and try again.')
      window.recaptchaVerifier?.clear()
      window.recaptchaVerifier = undefined
    }
    setLoading(false)
  }

  async function handleVerifyOtp() {
    if (!confirmation) return
    setLoading(true)
    setError('')
    try {
      const result = await confirmation.confirm(otp)
      const idToken = await result.user.getIdToken()
      if (await exchangeToken(idToken)) {
        router.push('/personal')
      } else {
        await auth.signOut()
        setError('This phone number is not authorised.')
        setLoading(false)
      }
    } catch {
      setError('Invalid code. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <p className="text-xs font-mono text-accent tracking-[0.2em] uppercase mb-4">Admin</p>
        <h1
          className="font-display text-3xl text-foreground mb-8"
          style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
        >
          Sign in
        </h1>

        {error && <p className="text-sm font-mono text-accent mb-4">{error}</p>}

        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading || !!confirmation}
          className="w-full flex items-center justify-center gap-3 py-3 bg-surface border border-border text-foreground font-medium text-sm rounded-full transition-all duration-200 hover:border-accent disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-mono text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* reCAPTCHA anchor — must always be in the DOM */}
        <div id="recaptcha-container" />

        {/* Phone */}
        {!confirmation ? (
          <div className="flex flex-col gap-3">
            <input
              type="tel"
              placeholder="+47 000 00 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted text-sm font-mono focus:outline-none focus:border-accent transition-colors duration-200"
            />
            <button
              onClick={handleSendCode}
              disabled={loading || phone.length < 8}
              className="w-full py-3 bg-surface border border-border text-foreground font-medium text-sm rounded-full transition-all duration-200 hover:border-accent disabled:opacity-40"
            >
              {loading ? 'Sending…' : 'Send code via SMS'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-mono text-muted">Code sent to {phone}</p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted text-sm font-mono focus:outline-none focus:border-accent transition-colors duration-200 tracking-widest"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full py-3 bg-accent text-background font-medium text-sm rounded-full transition-all duration-200 hover:opacity-90 disabled:opacity-40"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
            <button
              onClick={() => { setConfirmation(null); setOtp(''); setError('') }}
              className="text-xs font-mono text-muted hover:text-foreground transition-colors duration-200 text-center"
            >
              ← Try again
            </button>
          </div>
        )}

        <a
          href="/personal"
          className="block mt-6 text-center text-xs font-mono text-muted hover:text-foreground transition-colors duration-200"
        >
          ← Back to personal page
        </a>
      </div>
    </main>
  )
}
