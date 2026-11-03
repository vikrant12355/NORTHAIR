import { useState, useEffect, useCallback } from 'react';
import { hotspotApi } from '../api/hotspot.api';
import { HotspotRank, HeatmapStation } from '../types';

export function useHotspots() {
  const [rankings, setRankings] = useState<HotspotRank[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapStation[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotspots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rankData, heatData, distData] = await Promise.all([
        hotspotApi.getRankings(25),
        hotspotApi.getHeatmap(),
        hotspotApi.getDistribution(),
      ]);
      setRankings(rankData);
      setHeatmap(heatData);
      setDistribution(distData);
    } catch (err: any) {
      setError(err.message || 'Failed to load hotspot data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotspots();
  }, [fetchHotspots]);

  return { rankings, heatmap, distribution, loading, error, refetch: fetchHotspots };
}

