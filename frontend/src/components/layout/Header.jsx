import { Flower } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="w-full h-16 bg-white dark:bg-zinc-800 px-6 py-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 z-30">
  
      {/* Title */}
      <h1 className="text-2xl text-zinc-700 dark:text-white font-bold flex items-center">
        <Flower size={28} className="text-emerald-700 dark:text-emerald-500 mr-2" /> Smart Greenhouse Dashboard
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-4">

        {/* Live clock */}
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          {time.toLocaleDateString()} — {time.toLocaleTimeString()}
        </div>

        {/* Refresh button */}
        <button 
          onClick={handleRefresh}
          className="bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-lg text-sm transition duration-200"
        >
          Refresh ↻
        </button>

      </div>
    </div>
  );
}