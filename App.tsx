import { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Menu, Sun, Moon } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Trade from './pages/Trade'
import Portfolio from './pages/Portfolio'
import Settings from './pages/Settings'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="md:hidden" onClick={() => setOpen(v => !v)}>
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-semibold">Trading Bot</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a className="hover:underline" href="/">Dashboard</a>
            <a className="hover:underline" href="/trade">Trade</a>
            <a className="hover:underline" href="/portfolio">Portfolio</a>
            <a className="hover:underline" href="/settings">Settings</a>
          </div>
          <button onClick={() => setDark(d => !d)} aria-label="Toggle Theme">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden pb-3 flex flex-col gap-2">
            <a className="hover:underline" href="/">Dashboard</a>
            <a className="hover:underline" href="/trade">Trade</a>
            <a className="hover:underline" href="/portfolio">Portfolio</a>
            <a className="hover:underline" href="/settings">Settings</a>
          </div>
        )}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 flex-1 w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

