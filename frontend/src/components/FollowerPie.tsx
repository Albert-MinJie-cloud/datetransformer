import ReactECharts from "echarts-for-react";
import type { FollowerStats } from "../api";

const COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"];

export default function FollowerPie({ stats }: { stats: FollowerStats | null }) {
  if (!stats) return null;

  const option = {
    tooltip: { trigger: "item" as const, formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["45%", "75%"],
        center: ["50%", "45%"],
        data: stats.ranges.map((r, i) => ({
          value: r.count,
          name: r.label,
          itemStyle: { color: COLORS[i] },
        })),
        label: { show: true, formatter: "{b}\n{d}%" },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.2)" },
        },
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">粉丝量级分布</h3>
      <ReactECharts option={option} style={{ height: 350 }} />
    </div>
  );
}
