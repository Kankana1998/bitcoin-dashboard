import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis, ReferenceDot } from "recharts";
import type { PricePoint } from "../hooks/useByBitWebSocket";

interface SparklineProps {

  data: PricePoint[];
  
  color: string;
}


export function SparklineChart({ data, color }: SparklineProps) {
  const { min, max, domainPadding, lastPoint } = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0, domainPadding: 0, lastPoint: null };
    
    const prices = data.map((d) => d.price);
    const minVal = Math.min(...prices);
    const maxVal = Math.max(...prices);
    const padding = (maxVal - minVal) * 0.15;
    
    return { 
      min: minVal, 
      max: maxVal, 
      domainPadding: padding,
      lastPoint: data[data.length - 1]
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div 
        className="h-full w-full flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400 animate-pulse"
        role="status"
        aria-live="polite"
      >
        Waiting for stream...
      </div>
    );
  }

  const chartId = `sparkline-${color.replace('#', '')}`;

  return (
    <div 
      className="h-full w-full relative group"
      role="img"
      aria-label={`Interactive trend chart. Price ranging from ${min.toFixed(2)} to ${max.toFixed(2)}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis domain={[min - domainPadding, max + domainPadding]} hide />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#${chartId})`}
            isAnimationActive={false}
          />
          {lastPoint && (
            <ReferenceDot
              x={data.length - 1}
              y={lastPoint.price}
              r={4}
              fill={color}
              stroke="white"
              strokeWidth={2}
              className="animate-pulse-glow"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
