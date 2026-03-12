import React from "react";
import { Navbar } from "./components/Navbar";
import { TradingViewWidget } from "./components/TradingViewWidget";
import { StatsCard } from "./components/StatsCard";
import { SparklineChart } from "./components/SparklineChart";

function App() {
  return (
    <div className="min-h-screen pt-4 pb-8 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <TradingViewWidget />
            </div>
            <StatsCard />
            <SparklineChart />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
