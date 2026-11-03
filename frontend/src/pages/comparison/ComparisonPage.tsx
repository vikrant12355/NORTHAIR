import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/analytics.api';
import { stationApi } from '../../api/station.api';
import { StationItem } from '../../types';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import {
  GitCompare,
  Plus,
  X,
  Check,
  TrendingUp,
  BarChart2,
  Sliders,
  Layers,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export const ComparisonPage: React.FC = () => {
  const [allStations, setAllStations] = useState<StationItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'site_1425', // Bawana (Industrial hotspot)
    'site_5125', // Chandigarh Sector 22 (High ventilation baseline)
    'site_145',  // Anand Vihar (Traffic canyon)
  ]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full station list
  useEffect(() => {
    stationApi.getStations()
      .then((res: any) => setAllStations(res || []))
      .catch((err: any) => console.error('Failed to load stations', err));
  }, []);

  // Fetch comparison data whenever selectedIds change
  useEffect(() => {
    if (selectedIds.length === 0) {
      setComparisonData([]);
      return;
    }
    setLoading(true);
    setError(null);
    analyticsApi.compare(selectedIds)
      .then((res: any) => {
        setComparisonData(res || []);
      })
      .catch((err: any) => setError(err?.message || 'Failed to compare stations'))
      .finally(() => setLoading(false));
  }, [selectedIds]);

  const toggleStation = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((s) => s !== id));
      }
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const applyPreset = (preset: 'hotspots_vs_clean' | 'delhi_corridor' | 'state_capitals') => {
    if (preset === 'hotspots_vs_clean') {
      setSelectedIds(['site_1425', 'site_5125']); // Bawana vs Chandigarh
    } else if (preset === 'delhi_corridor') {
      setSelectedIds(['site_145', 'site_1425', 'site_253']); // Anand Vihar, Bawana, RK Puram
    } else if (preset === 'state_capitals') {
      setSelectedIds(['site_5125', 'site_145']); // Chandigarh vs Delhi
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-[#E9EDE9] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#055237] tracking-wider uppercase">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Cross-Station Microclimate Benchmarking</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#202521]">Comparison Lab</h1>
            <p className="text-xs text-[#737B75] max-w-3xl leading-relaxed">
              Multi-station head-to-head empirical benchmarking. Evaluate microclimatic exposure, 
              particulate load, and meteorological buffering across up to 5 monitoring sites simultaneously.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737B75]">Presets:</span>
            <button
              onClick={() => applyPreset('hotspots_vs_clean')}
              className="px-2.5 py-1 bg-white border border-[#E9EDE9] rounded-md hover:bg-[#F0F5EE] transition-colors font-medium text-[#202521]"
            >
              Hotspot vs Clean
            </button>
            <button
              onClick={() => applyPreset('delhi_corridor')}
              className="px-2.5 py-1 bg-white border border-[#E9EDE9] rounded-md hover:bg-[#F0F5EE] transition-colors font-medium text-[#202521]"
            >
              Delhi Corridors
            </button>
          </div>
        </div>
      </div>

      {/* Station Selector Bar */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#202521]">
            Selected Stations ({selectedIds.length} / 5 max)
          </span>
          <span className="text-[11px] text-[#737B75] font-mono">
            Click to add or remove sites
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allStations.map((st) => {
            const isSelected = selectedIds.includes(st.stationId);
            return (
              <button
                key={st.stationId}
                onClick={() => toggleStation(st.stationId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#055237] text-white border-[#055237] shadow-sm font-semibold'
                    : 'bg-[#FAFAF8] text-[#404943] border-[#E9EDE9] hover:border-[#CAD4C9]'
                }`}
              >
                <span>{st.stationName}</span>
                <span className="text-[10px] opacity-75">({st.city})</span>
                {isSelected ? <X className="w-3 h-3 ml-0.5" /> : <Plus className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : error ? (
        <ErrorState title="Comparison Failed" message={error} onRetry={() => setSelectedIds([...selectedIds])} />
      ) : (
        <>
          {/* Multi-Station Bar Chart */}
          <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDE9] mb-4">
              <div>
                <h3 className="font-semibold text-sm text-[#202521]">Multi-Pollutant Concentration Comparison</h3>
                <p className="text-xs text-[#737B75]">
                  Comparing mean PM2.5, PM10, NO2, and Ozone across selected stations
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F5EE" />
                  <XAxis dataKey="stationName" tick={{ fill: '#737B75', fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fill: '#737B75', fontSize: 12 }} unit=" µg/m³" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9EDE9', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="avgPM25" name="PM2.5 (µg/m³)" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgPM10" name="PM10 (µg/m³)" fill="#D97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgNO2" name="NO2 (µg/m³)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgOzone" name="Ozone (µg/m³)" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistical Matrix Table */}
          <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
            <h3 className="font-semibold text-sm text-[#202521] mb-1">Statistical Microclimate Matrix</h3>
            <p className="text-xs text-[#737B75] mb-4">Detailed metric breakdown per station from DuckDB Parquet engine</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAFAF8] text-[#737B75] border-y border-[#E9EDE9]">
                  <tr>
                    <th className="py-2.5 px-3 font-sans">Station</th>
                    <th className="py-2.5 px-3 font-sans">City / State</th>
                    <th className="py-2.5 px-3">Avg PM2.5</th>
                    <th className="py-2.5 px-3">Median PM2.5</th>
                    <th className="py-2.5 px-3">Max PM2.5</th>
                    <th className="py-2.5 px-3">Avg PM10</th>
                    <th className="py-2.5 px-3">Avg NO2</th>
                    <th className="py-2.5 px-3">Avg WS (m/s)</th>
                    <th className="py-2.5 px-3">Total Data Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDE9]">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F0F5EE]/50 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-semibold text-[#202521]">{row.stationName}</td>
                      <td className="py-2.5 px-3 font-sans text-[#737B75]">{row.city}, {row.state}</td>
                      <td className="py-2.5 px-3 font-bold text-[#DC2626]">{row.avgPM25}</td>
                      <td className="py-2.5 px-3 text-[#202521]">{row.medianPM25}</td>
                      <td className="py-2.5 px-3 text-red-700 font-bold">{row.maxPM25}</td>
                      <td className="py-2.5 px-3 text-[#D97706]">{row.avgPM10}</td>
                      <td className="py-2.5 px-3 text-[#2563EB]">{row.avgNO2}</td>
                      <td className="py-2.5 px-3 text-[#055237]">{row.avgWS}</td>
                      <td className="py-2.5 px-3 text-[#737B75]">{Number(row.totalPoints).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
