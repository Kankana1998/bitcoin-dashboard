import { memo } from "react";
import { cn } from "../utils/cn";

interface StatsCardProps {
  title: string;
  value: string | number;
  highlight?: "up" | "down" | null;
  prefix?: string;
  suffix?: string;
  valueClassName?: string;
}

export const StatsCard = memo(function MStatsCard({
  title,
  value,
  highlight,
  prefix = "",
  suffix = "",
  valueClassName = "",
}: StatsCardProps) {
  return (
    <div
      aria-label={`${title}: ${prefix}${value}${suffix}`}
      className={cn(
        "glass-panel group p-6 flex flex-col justify-between overflow-hidden relative rounded-[2rem]",
        "bg-white/50 dark:bg-white/[0.02]",
        "hover:scale-[1.02] hover:shadow-xl transition-all duration-500",
        highlight === "up" && "animate-flash-green",
        highlight === "down" && "animate-flash-red",
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-crypto-blue/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-crypto-blue/10 transition-colors duration-500"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-crypto-blue/40"></div>
        <h3
          className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap"
          aria-hidden="true"
        >
          {title}
        </h3>
      </div>

      <div className="flex items-baseline gap-1 relative z-10" aria-hidden="true">
        {prefix && (
          <span className="text-gray-400 dark:text-gray-600 text-lg font-medium">{prefix}</span>
        )}
        <span
          className={cn(
            "text-2xl font-bold tracking-tight text-gray-900 dark:text-white tabular-nums",
            valueClassName,
          )}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest ml-1">
            {suffix}
          </span>
        )}
      </div>
      
      <div className="mt-3 h-1 w-full bg-gray-100 dark:bg-white/[0.03] rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-crypto-blue/20 rounded-full group-hover:w-1/2 transition-all duration-700 ease-out"></div>
      </div>
    </div>
  );
});
