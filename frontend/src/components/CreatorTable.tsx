import { useState, useEffect, useCallback } from "react";
import type { Creator, SourceItem } from "../api";
import { fetchCreators, fetchSources } from "../api";

function formatFollowers(n: number | null) {
  if (n == null) return "-";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 10_000) return (n / 10_000).toFixed(1) + "万";
  return n.toLocaleString();
}

export default function CreatorTable() {
  const [data, setData] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [sourceFilter, setSourceFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [followerMin, setFollowerMin] = useState("");
  const [followerMax, setFollowerMax] = useState("");
  const [sortBy, setSortBy] = useState("followers_count");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);

  const loadSources = useCallback(async () => {
    const srcs = await fetchSources();
    setSources(srcs);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchCreators({
      page,
      page_size: pageSize,
      source_file: sourceFilter,
      keyword,
      follower_min: followerMin ? Number(followerMin) : "",
      follower_max: followerMax ? Number(followerMax) : "",
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    setData(result.data);
    setTotal(result.total);
    setLoading(false);
  }, [page, pageSize, sourceFilter, keyword, followerMin, followerMax, sortBy, sortOrder]);

  useEffect(() => { loadSources(); }, [loadSources]);
  useEffect(() => { loadData(); }, [loadData]);

  const totalPages = Math.ceil(total / pageSize);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-indigo-500 ml-1">{sortOrder === "desc" ? "↓" : "↑"}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">达人数据明细</h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="搜索微信号/昵称..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          className="border rounded px-3 py-1.5 text-sm w-48"
        />
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="border rounded px-3 py-1.5 text-sm max-w-48"
        >
          <option value="">全部来源</option>
          {sources.map((s) => (
            <option key={s.source_file} value={s.source_file}>
              {s.source_file.replace(".xlsx", "")} ({s.count})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="最低粉丝"
          value={followerMin}
          onChange={(e) => { setFollowerMin(e.target.value); setPage(1); }}
          className="border rounded px-3 py-1.5 text-sm w-28"
        />
        <input
          type="number"
          placeholder="最高粉丝"
          value={followerMax}
          onChange={(e) => { setFollowerMax(e.target.value); setPage(1); }}
          className="border rounded px-3 py-1.5 text-sm w-28"
        />
        <span className="text-sm text-gray-400 self-center">共 {total} 条</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-2">小红书昵称</th>
              <th className="py-2 px-2 cursor-pointer select-none" onClick={() => toggleSort("followers_count")}>
                粉丝数<SortIcon field="followers_count" />
              </th>
              <th className="py-2 px-2">微信号</th>
              <th className="py-2 px-2">微信昵称</th>
              <th className="py-2 px-2">小红书ID</th>
              <th className="py-2 px-2">宝宝年龄</th>
              <th className="py-2 pl-2">来源</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-8 text-center text-gray-400">加载中...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-gray-400">暂无数据</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-2 font-medium text-gray-800 max-w-32 truncate" title={row.xhs_nickname || ""}>
                    {row.xhs_nickname || "-"}
                  </td>
                  <td className="py-2 px-2 whitespace-nowrap">{formatFollowers(row.followers_count)}</td>
                  <td className="py-2 px-2 text-gray-500 text-xs max-w-28 truncate" title={row.wechat_id || ""}>{row.wechat_id || "-"}</td>
                  <td className="py-2 px-2 text-gray-600 max-w-24 truncate" title={row.wechat_nickname || ""}>{row.wechat_nickname || "-"}</td>
                  <td className="py-2 px-2 text-gray-500 text-xs">{row.xhs_account_id || "-"}</td>
                  <td className="py-2 px-2">{row.baby_age || "-"}</td>
                  <td className="py-2 pl-2 text-xs text-gray-400 max-w-40 truncate" title={row.source_file}>
                    {row.source_file.replace(".xlsx", "")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-30"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded text-sm disabled:opacity-30"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
