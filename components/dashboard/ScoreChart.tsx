'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Point {
  label: string;
  score: number;
  role: string;
}

const TOKENS = ['chart-1', 'chart-grid', 'muted-foreground', 'surface', 'border', 'foreground'] as const;

export function ScoreChart({ data }: { data: Point[] }) {
  const c = useThemeColors(TOKENS);

  return (
    <figure>
      <div className="h-56" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="score-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c['chart-1']} stopOpacity={0.18} />
                <stop offset="100%" stopColor={c['chart-1']} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={c['chart-grid']} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: c['muted-foreground'] }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tick={{ fontSize: 11, fill: c['muted-foreground'] }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ stroke: c.border }}
              contentStyle={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                fontSize: 12,
                color: c.foreground,
              }}
              labelStyle={{ color: c['muted-foreground'] }}
              formatter={(value, _name, item) => [`${value}/100`, (item?.payload as Point | undefined)?.role ?? 'Score']}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={c['chart-1']}
              strokeWidth={2}
              fill="url(#score-fill)"
              dot={{ r: 3, fill: c['chart-1'], strokeWidth: 0 }}
              activeDot={{ r: 5, fill: c['chart-1'], strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        Scores over time: {data.map((d) => `${d.label} ${d.score}`).join(', ')}.
      </figcaption>
    </figure>
  );
}
