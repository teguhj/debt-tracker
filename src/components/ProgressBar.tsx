'use client';

interface ProgressBarProps {
  paid: number;
  principal: number;
}

export default function ProgressBar({ paid, principal }: ProgressBarProps) {
  const percentage = principal > 0 ? (paid / principal) * 100 : 0;

  return (
    <div className="w-full mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">상환 진행률</span>
        <span className="font-semibold text-green-600">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
