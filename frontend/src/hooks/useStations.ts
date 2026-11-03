import { useState, useEffect, useCallback } from 'react';
import { stationApi } from '../api/station.api';
import { StationItem } from '../types';
import { useGlobalFilters } from '../context/FilterContext';

export function useStations(searchQuery = '', limit = 50, offset = 0) {
  const { filters } = useGlobalFilters();
  const [stations, setStations] = useState<StationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stationApi.getStations({
        state: filters.state,
        city: filters.city,
        search: searchQuery,
        limit,
        offset,
      });
      setStations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch monitoring stations');
    } finally {
      setLoading(false);
    }
  }, [filters.state, filters.city, searchQuery, limit, offset]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return { stations, loading, error, refetch: fetchStations };
}

