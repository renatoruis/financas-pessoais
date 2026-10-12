'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Currency } from '@/domain/shared/currency';
import { formatMoney } from '@/ui/format';

const CENTS = 100;
const CHART_HEIGHT = 300;

export interface ChartSeries {
  readonly key: string;
  readonly label: string;
  readonly color: string;
}

export type ChartPoint = { readonly label: string } & Record<string, number | string>;

interface ComboChartProps {
  /** Valores em cêntimos. */
  readonly data: readonly ChartPoint[];
  readonly currency: Currency;
  readonly bars?: readonly ChartSeries[];
  readonly lines?: readonly ChartSeries[];
}

/** Barras + linhas por mês (uma só moeda por gráfico). */
export function ComboChart({ data, currency, bars = [], lines = [] }: ComboChartProps) {
  const format = (cents: number) => formatMoney({ cents, currency });
  const compact = new Intl.NumberFormat('pt-PT', { notation: 'compact' });
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <ComposedChart data={[...data]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="#eef2f6" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={48}
          tickFormatter={(v: number) => compact.format(v / CENTS)}
        />
        <Tooltip
          formatter={(value) => format(Number(value))}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        {bars.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            radius={[6, 6, 0, 0]}
            isAnimationActive={false}
          />
        ))}
        {lines.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            type="monotone"
            isAnimationActive={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
