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
    <div className="w-full h-16 bg-white p-4 flex justify-between items-center border-b border-gray-200 top-0 z-30">
      
      {/* Title */}
      <h1 className="text-2xl text-zinc-700 font-bold flex items-center gap-2">
        <Flower size={28} className="text-emerald-700" /> Smart Greenhouse Dashboard
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-6">

        {/* Live clock */}
        <div className="text-sm text-gray-600">
          {time.toLocaleDateString()} — {time.toLocaleTimeString()}
        </div>

        {/* System status */}
        <div className="bg-green-100 border-green-200 border text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
          Everything Normal
        </div>

        {/* Refresh button */}
        <button 
          onClick={handleRefresh}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm transition duration-200"
        >
          Refresh ↻
        </button>

      </div>
    </div>
  );
}