import ReactECharts from "echarts-for-react";
import type { SourceItem } from "../api";

export default function SourceChart({ sources }: { sources: SourceItem[] }) {
  if (!sources.length) return null;

  const names = sources.map((s) => s.source_file.replace(".xlsx", ""));
  const values = sources.map((s) => s.count);

  const option = {
    tooltip: { trigger: "axis" as const },
    xAxis: {
      type: "value" as const,
    },
    yAxis: {
      type: "category" as const,
      data: names,
      axisLabel: { fontSize: 11, width: 120, overflow: "truncate" as const },
      inverse: true,
    },
    series: [
      {
        type: "bar",
        data: values,
        itemStyle: {
          color: { type: "linear", x: 1, y: 0, x2: 0, y2: 0, colorStops: [{ offset: 0, color: "#34d399" }, { offset: 1, color: "#10b981" }] } as any,
          borderRadius: [0, 4, 4, 0],
        },
        label: { show: true, position: "right" as const, fontSize: 12 },
      },
    ],
    grid: { left: 140, right: 50, top: 10, bottom: 10 },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">各来源文件达人数量</h3>
      <ReactECharts option={option} style={{ height: 380 }} />
    </div>
  );
}
