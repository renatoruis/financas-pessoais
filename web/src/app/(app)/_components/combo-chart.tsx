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
const TICK = { fill: 'var(--color-fg-muted)' };
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid var(--color-line)',
  background: 'var(--color-surface)',
};

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
  /** Empilha as barras (negativos abaixo do zero). */
  readonly stacked?: boolean;
}

/** Barras + linhas por mês (uma só moeda por gráfico). */
export function ComboChart({ data, currency, bars = [], lines = [], stacked }: ComboChartProps) {
  const format = (cents: number) => formatMoney({ cents, currency });
  const compact = new Intl.NumberFormat('pt-PT', { notation: 'compact' });
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <ComposedChart
        data={[...data]}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        stackOffset={stacked ? 'sign' : undefined}
      >
        <CartesianGrid vertical={false} stroke="var(--color-line-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} tick={TICK} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={48}
          tick={TICK}
          tickFormatter={(v: number) => compact.format(v / CENTS)}
        />
        <Tooltip
          formatter={(value) => format(Number(value))}
          cursor={{ fill: 'var(--color-surface-strong)', opacity: 0.6 }}
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: 'var(--color-fg)', fontWeight: 600 }}
          itemStyle={{ color: 'var(--color-fg-muted)' }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value: string) => <span className="text-fg-muted">{value}</span>}
        />
        {bars.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            stackId={stacked ? 'stack' : undefined}
            radius={stacked ? 0 : [6, 6, 0, 0]}
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
            dot={{ r: 3, fill: 'var(--color-surface)' }}
            type="monotone"
            isAnimationActive={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
