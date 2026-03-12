import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { useTheme } from "../hooks/useTheme";
import { memo } from "react";

export const TradingViewWidget = memo(function MTradingViewWidget() {
  const { theme } = useTheme();

  return (
    <div className="w-full h-full glass-panel overflow-hidden relative rounded-[2rem]">
      <div className="absolute inset-0 z-0">
        <AdvancedRealTimeChart
          symbol="BYBIT:BTCUSDT"
          theme={theme === "dark" ? "dark" : "light"}
          autosize
          hide_side_toolbar={false}
          allow_symbol_change={false}
          timezone="Etc/UTC"
          style="1"
          locale="en"
          enable_publishing={false}
          backgroundColor={theme === "dark" ? "#1e293b" : "#ffffff"}
          hide_top_toolbar={false}
        />
      </div>
    </div>
  );
});
