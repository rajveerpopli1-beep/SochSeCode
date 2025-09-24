import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function Trade() {
  const [symbol, setSymbol] = useState('AAPL')
  const [qty, setQty] = useState(1)
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [limitPrice, setLimitPrice] = useState<number | ''>('')
  const [expiry, setExpiry] = useState('')
  const [strike, setStrike] = useState<number | ''>('')
  const [cp, setCp] = useState<'CALL' | 'PUT'>('CALL')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (side: 'buy' | 'sell') => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_BASE}/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          side,
          quantity: qty,
          order_type: orderType,
          limit_price: limitPrice === '' ? null : Number(limitPrice),
          time_in_force: 'day',
          asset_class: 'option',
          strike_price: strike === '' ? null : Number(strike),
          expiry: expiry || null,
          strategy: cp,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Trade failed')
      setMessage('Order submitted successfully')
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-semibold">Options Trade</h2>
      {message && (
        <div className="p-2 border rounded text-sm border-gray-200 dark:border-gray-700">{message}</div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Symbol</span>
          <input className="input" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Quantity</span>
          <input className="input" type="number" value={qty} onChange={e => setQty(Number(e.target.value))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Expiry (YYYY-MM-DD)</span>
          <input className="input" placeholder="2025-12-19" value={expiry} onChange={e => setExpiry(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Strike</span>
          <input className="input" type="number" value={strike} onChange={e => setStrike(e.target.value === '' ? '' : Number(e.target.value))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Call/Put</span>
          <select className="input" value={cp} onChange={e => setCp(e.target.value as any)}>
            <option value="CALL">CALL</option>
            <option value="PUT">PUT</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Order Type</span>
          <select className="input" value={orderType} onChange={e => setOrderType(e.target.value as any)}>
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </label>
        {orderType === 'limit' && (
          <label className="flex flex-col gap-1 col-span-2">
            <span className="text-sm">Limit Price</span>
            <input className="input" type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
        )}
      </div>
      <div className="flex gap-3">
        <button disabled={loading} onClick={() => submit('buy')} className="btn">{loading ? 'Submitting...' : 'Execute BUY'}</button>
        <button disabled={loading} onClick={() => submit('sell')} className="btn-secondary">{loading ? 'Submitting...' : 'Execute SELL'}</button>
      </div>
    </div>
  )
}

