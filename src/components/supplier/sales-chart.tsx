'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoney } from '@/lib/utils/money';

export function SalesChart({ data }: { data: { date: string; revenueSen: number }[] }) {
  if (data.length === 0) {
    return <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">No revenue yet in this period.</p>;
  }

  const chartData = data.map((d) => ({ date: new Date(d.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }), revenue: d.revenueSen / 100 }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE3D8" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#767066' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#767066' }} axisLine={false} tickLine={false} tickFormatter={(v) => `RM${v}`} width={64} />
          <Tooltip formatter={(value: number) => formatMoney(Math.round(value * 100))} labelClassName="text-ink" />
          <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
