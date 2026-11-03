import React, { createContext, useContext, useState, useEffect } from 'react';
import { GlobalFilters } from '../types';
import { systemApi } from '../api/quality.api';

interface FilterContextType {
  filters: GlobalFilters;
  setFilter: (key: keyof GlobalFilters, value: string) => void;
  resetFilters: () => void;
  options: {
    states: string[];
    cities: Array<{ city: string; state: string }>;
    stations: Array<{ id: string; name: string; city: string; state: string }>;
    pollutants: Array<{ id: string; name: string; unit: string; std: number }>;
    resolutions: string[];
  };
  isLoadingOptions: boolean;
}

const defaultFilters: GlobalFilters = {
  state: 'ALL',
  city: 'ALL',
  stationId: 'ALL',
  pollutant: 'PM25',
  resolution: 'Daily Mean (24h Std)',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters);
  const [options, setOptions] = useState<FilterContextType['options']>({
    states: ['Chandigarh', 'Delhi', 'Haryana', 'Punjab'],
    cities: [],
    stations: [],
    pollutants: [
      { id: 'PM25', name: 'PM2.5 (Fine Particulate)', unit: 'µg/m³', std: 60 },
      { id: 'PM10', name: 'PM10 (Inhalable Coarse)', unit: 'µg/m³', std: 100 },
      { id: 'AQI', name: 'Composite AQI Index', unit: 'AQI', std: 100 },
      { id: 'NO2', name: 'Nitrogen Dioxide (NO2)', unit: 'µg/m³', std: 80 },
    ],
    resolutions: ['Daily Mean (24h Std)', '1-Hour High Fidelity', '8-Hour Regulatory Window'],
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    systemApi
      .getFilters()
      .then((data) => {
        if (data) {
          setOptions(data);
        }
      })
      .catch((err) => console.error('Failed to load filter options:', err))
      .finally(() => setIsLoadingOptions(false));
  }, []);

  const setFilter = (key: keyof GlobalFilters, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // If state changed, reset city and station if incompatible
      if (key === 'state' && value !== 'ALL') {
        next.city = 'ALL';
        next.stationId = 'ALL';
      }
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters, options, isLoadingOptions }}>
      {children}
    </FilterContext.Provider>
  );
};

export function useGlobalFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within a FilterProvider');
  }
  return context;
}

export function useFilters() {
  const ctx = useGlobalFilters();
  return {
    ...ctx,
    setFilters: (partial: Partial<GlobalFilters>) => {
      Object.entries(partial).forEach(([k, v]) => {
        if (v !== undefined) ctx.setFilter(k as keyof GlobalFilters, v);
      });
    },
  };
}
