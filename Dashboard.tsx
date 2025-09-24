import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function Dashboard() {
  const [ticker, setTicker] = useState<Array<{ symbol: string; price: number }>>([
    { symbol: 'AAPL', price: 0 },
    { symbol: 'MSFT', price: 0 },
    { symbol: 'SPY', price: 0 },
  ])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      const updated = await Promise.all(
        ticker.map(async t => {
          try {
            const res = await fetch(`${API_BASE}/price?symbol=${t.symbol}`)
            const data = await res.json()
            return { symbol: t.symbol, price: data.price ?? 0 }
          } catch {
            return t
          }
        })
      )
      if (isMounted) setTicker(updated)
    }
    load()
    const id = setInterval(load, 5000)
    return () => { isMounted = false; clearInterval(id) }
  }, [])

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto whitespace-nowrap py-2 border rounded-md border-gray-200 dark:border-gray-800">
        <div className="flex gap-6 px-4">
          {ticker.map(t => (
            <div key={t.symbol} className="flex items-center gap-2">
              <span className="font-semibold">{t.symbol}</span>
              <span>${t.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <a href="/trade" className="p-6 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800 text-center">BUY / SELL Options</a>
        <a href="/portfolio" className="p-6 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800 text-center">View Portfolio</a>
      </div>
    </div>
  )
}


