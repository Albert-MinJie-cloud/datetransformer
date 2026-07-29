// 开发环境通过 Vite proxy，生产环境同域直接访问 /api
const BASE = "/api";

export interface Creator {
  id: number;
  wechat_id: string | null;
  wechat_nickname: string | null;
  xhs_nickname: string | null;
  xhs_account_id: string | null;
  homepage_link: string | null;
  followers_count: number | null;
  baby_age: string | null;
  source_file: string;
  created_at: string;
}

export interface PaginatedResponse {
  total: number;
  page: number;
  page_size: number;
  data: Creator[];
}

export interface OverviewStats {
  total_creators: number;
  total_with_followers: number;
  median_followers: number;
}

export interface DistributionItem {
  range: string;
  count: number;
}

export interface RangeItem {
  label: string;
  count: number;
}

export interface FollowerStats {
  distribution: DistributionItem[];
  ranges: RangeItem[];
}

export interface SourceItem {
  source_file: string;
  count: number;
}

export async function fetchCreators(params: Record<string, string | number>): Promise<PaginatedResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const res = await fetch(`${BASE}/creators?${qs}`);
  return res.json();
}

export async function fetchOverview(): Promise<OverviewStats> {
  const res = await fetch(`${BASE}/stats/overview`);
  return res.json();
}

export async function fetchFollowerStats(): Promise<FollowerStats> {
  const res = await fetch(`${BASE}/stats/followers`);
  return res.json();
}

export async function fetchSources(): Promise<SourceItem[]> {
  const res = await fetch(`${BASE}/sources`);
  return res.json();
}
