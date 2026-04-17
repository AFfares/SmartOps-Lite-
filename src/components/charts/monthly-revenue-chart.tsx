"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type RevenuePoint = { month: string; revenueK: number };

export function MonthlyRevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={12} />
          <YAxis stroke="rgba(255,255,255,0.35)" fontSize={12} width={32} />
          <Tooltip
            contentStyle={{
              background: "rgba(5,7,13,0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.7)" }}
          />
          <Line type="monotone" dataKey="revenueK" stroke="#4f7cff" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
