import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "../hooks/useTheme";
import type { ConnectionStatus } from "../hooks/useByBitWebSocket";
import { cn } from "../utils/cn";

interface NavbarProps {
  status: ConnectionStatus;
}

export function Navbar({ status }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-panel sticky top-0 z-50 w-full rounded-none border-b border-gray-100 dark:border-white/5 animate-entrance">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-500 to-orange-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-400 flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-2xl leading-none">₿</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Bitcoin Live
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-crypto-blue bg-crypto-blue/10 px-1.5 py-0.5 rounded">Perpetual</span>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">BTC / USDT</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gray-50/30 dark:bg-gray-900/40 backdrop-blur-md">
            <div className="relative flex h-2.5 w-2.5">
              {status === "connected" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crypto-green opacity-40"></span>
              )}
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2.5 w-2.5 transition-colors duration-500",
                  status === "connected"
                    ? "bg-crypto-green shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : status === "connecting"
                      ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                      : "bg-crypto-red shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                )}
              ></span>
            </div>
            <span
              className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
              role="status"
              aria-live="polite"
            >
              {status}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="group cursor-pointer relative p-3 rounded-2xl bg-white dark:bg-gray-800 hover:scale-110 transition-all duration-300 shadow-sm focus:outline-none"
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            <div className="absolute inset-0 rounded-2xl bg-crypto-blue/0 group-hover:bg-crypto-blue/5 transition-colors"></div>
            {theme === "dark" ? (
              <LuSun className="w-5 h-5 text-yellow-500 transition-colors" />
            ) : (
              <LuMoon className="w-5 h-5 text-gray-600 transition-colors" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
