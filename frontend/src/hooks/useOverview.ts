import { useState, useEffect, useCallback } from 'react';
import { overviewApi } from '../api/overview.api';
import { OverviewSummary, TrajectoryPoint, StateComparison } from '../types';
import { useGlobalFilters } from '../context/FilterContext';

export function useOverview() {
  const { filters } = useGlobalFilters();
  const [summary, setSummary] = useState<OverviewSummary | null>(null);
  const [trends, setTrends] = useState<TrajectoryPoint[]>([]);
  const [regionalComparison, setRegionalComparison] = useState<StateComparison[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, trendData, regData] = await Promise.all([
        overviewApi.getSummary({ state: filters.state, city: filters.city, stationId: filters.stationId }),
        overviewApi.getTrends({ state: filters.state, limit: 30 }),
        overviewApi.getRegionalComparison(),
      ]);
      setSummary(sumData);
      setTrends(trendData);
      setRegionalComparison(regData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overview telemetry');
    } finally {
      setLoading(false);
    }
  }, [filters.state, filters.city, filters.stationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary, trends, regionalComparison, loading, error, refetch: fetchData };
}

