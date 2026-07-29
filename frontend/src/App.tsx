import { useEffect, useState } from "react";
import StatsCards from "./components/StatsCards";
import FollowerChart from "./components/FollowerChart";
import FollowerPie from "./components/FollowerPie";
import SourceChart from "./components/SourceChart";
import CreatorTable from "./components/CreatorTable";
import type { OverviewStats, FollowerStats, SourceItem } from "./api";
import { fetchOverview, fetchFollowerStats, fetchSources } from "./api";

function App() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [followerStats, setFollowerStats] = useState<FollowerStats | null>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchOverview(), fetchFollowerStats(), fetchSources()])
      .then(([ov, fs, src]) => {
        setOverview(ov);
        setFollowerStats(fs);
        setSources(src);
      })
      .catch((e) => setError("无法连接后端服务，请确保 server 已启动: " + e.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">达人数据分析仪表盘</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <StatsCards stats={overview} />

        <div className="grid grid-cols-2 gap-6">
          <FollowerChart stats={followerStats} />
          <FollowerPie stats={followerStats} />
        </div>

        <SourceChart sources={sources} />

        <CreatorTable />
      </main>
    </div>
  );
}

export default App;
