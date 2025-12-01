// components/dashboard/HealthScoreCard.jsx
import { Heart, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';

const HealthScoreCard = ({ healthScore, plantHealth }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <Heart size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Greenhouse Health</h2>
            <p className="text-sm text-zinc-600">Overall system health score</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(healthScore)}`}>
            {healthScore}%
          </div>
          <div className="text-sm text-zinc-600">Health Score</div>
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={getScoreColor(healthScore).replace('text-', '')}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="339.292"
              strokeDashoffset={339.292 * (1 - healthScore / 100)}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(healthScore)}`}>
                {healthScore}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plant Health Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp size={16} className="text-green-600" />
            <div className="text-lg font-bold text-green-600">
              {plantHealth?.optimal || 0}
            </div>
          </div>
          <div className="text-xs text-green-700 font-medium">Optimal</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <AlertTriangle size={16} className="text-yellow-600" />
            <div className="text-lg font-bold text-yellow-600">
              {plantHealth?.needsAttention || 0}
            </div>
          </div>
          <div className="text-xs text-yellow-700 font-medium">Needs Attention</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <AlertCircle size={16} className="text-red-600" />
            <div className="text-lg font-bold text-red-600">
              {plantHealth?.critical || 0}
            </div>
          </div>
          <div className="text-xs text-red-700 font-medium">Critical</div>
        </div>
        
        <div className="text-center p-3 bg-zinc-50 rounded-lg border border-zinc-200">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <div className="text-lg font-bold text-zinc-800">
              {plantHealth?.total || 0}
            </div>
          </div>
          <div className="text-xs text-zinc-700 font-medium">Total Plants</div>
        </div>
      </div>
    </div>
  );
};

export default HealthScoreCard;