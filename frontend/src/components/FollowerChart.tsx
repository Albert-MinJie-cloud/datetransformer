import ReactECharts from "echarts-for-react";
import type { FollowerStats } from "../api";

export default function FollowerChart({ stats }: { stats: FollowerStats | null }) {
  if (!stats) return null;

  const option = {
    tooltip: { trigger: "axis" as const },
    xAxis: {
      type: "category" as const,
      data: stats.distribution.map((d) => d.range),
      axisLabel: { rotate: 45, fontSize: 11 },
    },
    yAxis: { type: "value" as const },
    series: [
      {
        name: "达人数",
        type: "bar",
        data: stats.distribution.map((d) => d.count),
        itemStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "#818cf8" },
              { offset: 1, color: "#6366f1" },
            ],
          } as any,
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
    grid: { left: 50, right: 20, top: 20, bottom: 60 },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">粉丝量分布</h3>
      <ReactECharts option={option} style={{ height: 350 }} />
    </div>
  );
}
