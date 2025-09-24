import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    alpacaKey: '',
    alpacaSecret: '',
    finnhubKey: '',
    maxTradeSize: 1000,
    stopLossPct: 20,
  })

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const ref = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data()
          setForm({
            alpacaKey: data.alpacaKey || '',
            alpacaSecret: data.alpacaSecret || '',
            finnhubKey: data.finnhubKey || '',
            maxTradeSize: data.maxTradeSize || 1000,
            stopLossPct: data.stopLossPct || 20,
          })
        }
      }
    })
  }, [])

  const save = async () => {
    if (!user) return
    setSaving(true)
    try {
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, form, { merge: true })
      alert('Settings saved')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>
      {!user ? (
        <button className="btn" onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>Sign in with Google</button>
      ) : (
        <div className="space-y-4">
          <div className="text-sm">Signed in as {user.email} <button className="underline" onClick={() => signOut(auth)}>Sign out</button></div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Alpaca API Key</span>
              <input className="input" value={form.alpacaKey} onChange={e => setForm({ ...form, alpacaKey: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Alpaca Secret</span>
              <input className="input" value={form.alpacaSecret} onChange={e => setForm({ ...form, alpacaSecret: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 col-span-2">
              <span className="text-sm">Finnhub API Key</span>
              <input className="input" value={form.finnhubKey} onChange={e => setForm({ ...form, finnhubKey: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Max Trade Size ($)</span>
              <input className="input" type="number" value={form.maxTradeSize} onChange={e => setForm({ ...form, maxTradeSize: Number(e.target.value) })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Stop Loss %</span>
              <input className="input" type="number" value={form.stopLossPct} onChange={e => setForm({ ...form, stopLossPct: Number(e.target.value) })} />
            </label>
          </div>
          <button disabled={saving} onClick={save} className="btn">{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      )}
    </div>
  )
}

