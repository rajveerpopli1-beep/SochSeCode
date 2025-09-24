import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

interface Position {
  symbol: string
  qty: string
  avg_entry_price: string
  unrealized_pl: string
}

export default function Portfolio() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/portfolio`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed to load portfolio')
        setPositions(data.positions || [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const chartData = Array.from({ length: 20 }).map((_, i) => ({ t: i, v: 10000 + Math.sin(i / 2) * 300 + i * 10 }))

  return (
    <div className="space-y-6">
      <div className="h-56 border rounded-md border-gray-200 dark:border-gray-800 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="t" hide />
            <YAxis hide domain={[9000, 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="v" stroke="#22c55e" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-xl font-semibold">Open Positions</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid md:grid-cols-2 gap-4">
        {positions.map((p, idx) => (
          <div key={idx} className="p-4 border rounded-md border-gray-200 dark:border-gray-800">
            <div className="flex justify-between">
              <div className="font-semibold">{p.symbol}</div>
              <div>{Number(p.unrealized_pl || 0).toFixed(2)}</div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Qty: {p.qty} • Entry: ${p.avg_entry_price}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold">Past Trades</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 dark:border-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left p-2 border-b">Timestamp</th>
              <th className="text-left p-2 border-b">Symbol</th>
              <th className="text-left p-2 border-b">Side</th>
              <th className="text-left p-2 border-b">Qty</th>
              <th className="text-left p-2 border-b">Price</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800">
                <td className="p-2 border-b">2025-09-24 10:{10 + i}</td>
                <td className="p-2 border-b">AAPL</td>
                <td className="p-2 border-b">BUY</td>
                <td className="p-2 border-b">1</td>
                <td className="p-2 border-b">$1.25</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

