import { useByBitWebSocket } from "./hooks/useByBitWebSocket";
import { Navbar } from "./components/Navbar";
import { StatsCard } from "./components/StatsCard";
import { SparklineChart } from "./components/SparklineChart";
import { TradingViewWidget } from "./components/TradingViewWidget";
import { cn } from "./utils/cn";
import {
  LuTrendingUp,
  LuTrendingDown,
  LuCircleAlert,
  LuRefreshCw,
} from "react-icons/lu";

// Formatting Functions
const formatPrice = (p?: string) => {
  if (!p) return "---";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(parseFloat(p));
};

const formatVolume = (v?: string) => {
  if (!v) return "---";
  const vol = parseFloat(v);
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    vol,
  );
};

const formatPercent = (p?: string) => {
  if (!p) return "---";
  const num = parseFloat(p) * 100;
  return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
};

function App() {
  const { status, error, data, priceHistory, priceChangeDirection, retry } =
    useByBitWebSocket();

  const pcntChangeNum = data?.price24hPcnt ? parseFloat(data.price24hPcnt) : 0;
  const isPositive = pcntChangeNum >= 0;

  return (
    <div className="min-h-screen pt-0 pb-12 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-crypto-blue/5 rounded-full blur-[120px] dark:bg-crypto-blue/[0.03]"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] dark:bg-purple-900/[0.03]"></div>
      </div>

      <Navbar status={status} />

      <main className="flex-grow px-4 lg:px-8 mx-auto w-full max-w-7xl flex flex-col gap-8 mt-10">
        {/* Error Notification */}
        {error && (
          <div 
            className="flex items-center justify-between p-5 mb-4 text-red-800 border-l-4 border-red-400 bg-white/40 dark:bg-red-900/10 dark:text-red-300 dark:border-red-500 rounded-2xl shadow-xl backdrop-blur-xl animate-entrance" 
            role="alert"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <LuCircleAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">System Notice</p>
                <p className="text-xs font-medium opacity-80">{error}</p>
              </div>
            </div>
            <button
              onClick={() => retry()}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <LuRefreshCw className="w-4 h-4" />
              Reconnect
            </button>
          </div>
        )}

        {/* Top Stats Grid */}
        <section 
          className="grid grid-cols-2 lg:grid-cols-6 gap-4 animate-entrance"
          aria-label="Market Statistics Overview"
        >
          <StatsCard
            title="Current Price"
            value={formatPrice(data?.lastPrice)}
            highlight={priceChangeDirection}
            valueClassName={
              priceChangeDirection === "up"
                ? "text-crypto-green"
                : priceChangeDirection === "down"
                  ? "text-crypto-red"
                  : ""
            }
          />
          <StatsCard title="Mark Price" value={formatPrice(data?.markPrice)} />
          <StatsCard title="Peak (24h)" value={formatPrice(data?.highPrice24h)} />
          <StatsCard title="Floor (24h)" value={formatPrice(data?.lowPrice24h)} />
          <StatsCard
            title="Volume"
            value={formatVolume(data?.turnover24h)}
            suffix=" USDT"
          />

          <div 
            className={cn(
               "glass-panel p-6 flex flex-col justify-between overflow-hidden relative rounded-[2rem]",
               "bg-white/50 dark:bg-white/[0.02]",
               "hover:scale-[1.02] hover:shadow-xl transition-all duration-500"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-crypto-blue/40"></div>
              <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                24h Change
              </h3>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className={cn(
                "p-2 rounded-xl backdrop-blur-md",
                isPositive ? "bg-crypto-green/10 text-crypto-green" : "bg-crypto-red/10 text-crypto-red"
              )}>
                {isPositive ? (
                  <LuTrendingUp className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <LuTrendingDown className="w-6 h-6" aria-hidden="true" />
                )}
              </div>
              <span
                aria-label={`24 hour change is ${formatPercent(data?.price24hPcnt)}`}
                className={cn(
                  "text-2xl font-bold tracking-tighter tabular-nums",
                  isPositive ? "text-crypto-green" : "text-crypto-red"
                )}
              >
                {formatPercent(data?.price24hPcnt)}
              </span>
            </div>
            <div className="mt-3 h-1 w-full bg-gray-100 dark:bg-white/[0.03] rounded-full"></div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[600px] animate-entrance [animation-delay:0.1s]">
          {/* Main Chart Container */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
               <div>
                  <h2 className="text-xl font-bold tracking-tight">Technical Analysis</h2>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Live exchange feed</p>
               </div>
               <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-crypto-green animate-pulse"></span>
                  <span className="text-[10px] font-bold text-crypto-green uppercase tracking-widest">Live</span>
               </div>
            </div>
            <div className="flex-grow relative h-full min-h-[500px]">
              <TradingViewWidget />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Sparkline Board */}
            <div className="glass-panel p-8 flex flex-col h-72 rounded-[2rem] bg-gradient-to-br from-indigo-500/[0.02] to-transparent">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                    Minute Trend
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-1">Real-time pulses</p>
                </div>
                <span className="text-[10px] font-bold px-3 py-1 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 text-crypto-blue rounded-full shadow-sm backdrop-blur-md">
                  60S WINDOW
                </span>
              </div>
              <div 
                className="flex-grow -mx-4 relative" 
                aria-label="Minute-by-minute price momentum visualization"
              >
                <SparklineChart
                  data={priceHistory}
                  color={isPositive ? "#10b981" : "#f43f5e"}
                />
              </div>
            </div>

            {/* Market Info Card */}
            <div className="glass-panel p-8 flex flex-col flex-grow rounded-[2rem] bg-gradient-to-br from-crypto-blue/[0.02] via-transparent to-purple-500/[0.02]">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight mb-6">
                Market Details
              </h2>

              <div className="space-y-6">
                {[
                  { label: "Trading Pair", value: "BTCUSDT", icon: "₿" },
                  { label: "Asset Type", value: "Perpetual", icon: "∞" },
                  { label: "Stability", value: "High", icon: "✓" },
                  { label: "Stream", value: status, icon: "⚡" },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                       <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-white/5 text-[10px] text-gray-400 group-hover:text-crypto-blue transition-colors">{item.icon}</span>
                       <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white capitalize tracking-tight group-hover:translate-x-[-4px] transition-transform">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                 <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 italic">
                  Advanced data visualization powered by ByBit V5 API streams.
                 </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
