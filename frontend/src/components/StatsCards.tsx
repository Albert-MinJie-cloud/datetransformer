import type { OverviewStats } from "../api";

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 10_000) return (n / 10_000).toFixed(1) + "万";
  return n.toLocaleString();
}

export default function StatsCards({ stats }: { stats: OverviewStats | null }) {
  if (!stats) return null;

  const cards = [
    { label: "总达人数", value: stats.total_creators, color: "bg-blue-500" },
    { label: "有粉丝数", value: stats.total_with_followers, color: "bg-green-500" },
    { label: "中位粉丝数", value: formatNum(stats.median_followers), color: "bg-purple-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-10 rounded ${c.color}`} />
            <div>
              <div className="text-sm text-gray-500">{c.label}</div>
              <div className="text-2xl font-bold text-gray-800">{c.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
