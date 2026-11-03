import React, { useState, useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import {
  Database,
  Download,
  Filter,
  Search,
  RefreshCw,
  Table,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export const ExplorerPage: React.FC = () => {
  const { filters, setFilters } = useFilters();
  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(200);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.state && filters.state !== 'ALL') params.set('state', filters.state);
      params.set('limit', String(limit));

      // Query raw measurements via backend stations/overview route
      const res = await apiClient<any[]>(`/stations?${params.toString()}`);
      setRecords(res || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch query records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters.state, limit]);

  const filtered = records.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.city?.toLowerCase().includes(q) ||
      r.state?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q)
    );
  });

  const getCsvDownloadUrl = () => {
    const stateParam = filters.state && filters.state !== 'ALL' ? `?state=${encodeURIComponent(filters.state)}` : '';
    return `/api/v1${ENDPOINTS.EXPORT_MEASUREMENTS}${stateParam}`;
  };

  const getStationRegistryCsvUrl = () => {
    return `/api/v1${ENDPOINTS.EXPORT_STATIONS}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-[#E9EDE9] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#055237] tracking-wider uppercase">
          <Database className="w-3.5 h-3.5" />
          <span>Raw Parquet Telemetry • Query & Export Lab</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#202521]">Data Explorer</h1>
            <p className="text-xs text-[#737B75] max-w-3xl leading-relaxed">
              Direct analytical querying interface to 414,255 hourly IST records and 48 CAAQMS monitoring stations. 
              Filter parameters, inspect column payloads, and export high-performance CSV extracts for external modeling.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={getCsvDownloadUrl()}
              download="northair_measurements_2025.csv"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#055237] text-white rounded-lg text-xs font-medium hover:bg-[#04402b] transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Measurements CSV</span>
            </a>
            <a
              href={getStationRegistryCsvUrl()}
              download="northair_station_registry.csv"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E9EDE9] text-[#202521] rounded-lg text-xs font-medium hover:bg-[#F0F5EE] transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#055237]" />
              <span>Export Station Metadata</span>
            </a>
          </div>
        </div>
      </div>

      {/* Query Filter Toolbar */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#737B75] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station, city, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E9EDE9] text-xs font-mono focus:outline-none focus:border-[#055237] bg-[#FAFAF8]"
            />
          </div>

          <select
            value={filters.state}
            onChange={(e) => setFilters({ state: e.target.value })}
            className="px-3 py-1.5 rounded-lg border border-[#E9EDE9] text-xs bg-[#FAFAF8] text-[#202521] focus:outline-none focus:border-[#055237]"
          >
            <option value="ALL">All States (North India)</option>
            <option value="Delhi">Delhi</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-[#E9EDE9] text-xs font-mono bg-[#FAFAF8] text-[#202521] focus:outline-none focus:border-[#055237]"
          >
            <option value={100}>Limit 100</option>
            <option value={200}>Limit 200</option>
            <option value={500}>Limit 500</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs font-mono text-[#737B75]">
          <span>Displaying {filtered.length} active sites</span>
          <button
            onClick={fetchRecords}
            className="p-1.5 rounded-lg border border-[#E9EDE9] hover:bg-[#F0F5EE] transition-colors"
            title="Refresh query"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Query Results Table */}
      {loading ? (
        <Skeleton className="h-96" />
      ) : error ? (
        <ErrorState title="Query Execution Failed" message={error} onRetry={fetchRecords} />
      ) : (
        <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAFAF8] text-[#737B75] border-y border-[#E9EDE9]">
                <tr>
                  <th className="py-2.5 px-3 font-sans">Station ID</th>
                  <th className="py-2.5 px-3 font-sans">Station Name</th>
                  <th className="py-2.5 px-3 font-sans">City</th>
                  <th className="py-2.5 px-3 font-sans">State</th>
                  <th className="py-2.5 px-3">Latest AQI</th>
                  <th className="py-2.5 px-3 font-sans">Severity</th>
                  <th className="py-2.5 px-3">PM2.5 (µg/m³)</th>
                  <th className="py-2.5 px-3">PM10 (µg/m³)</th>
                  <th className="py-2.5 px-3">NO2 (µg/m³)</th>
                  <th className="py-2.5 px-3">Wind Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDE9]">
                {filtered.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#F0F5EE]/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#055237]">{r.id}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-[#202521]">{r.name}</td>
                    <td className="py-2.5 px-3 font-sans text-[#737B75]">{r.city}</td>
                    <td className="py-2.5 px-3 font-sans text-[#737B75]">{r.state}</td>
                    <td className="py-2.5 px-3 font-bold text-[#202521]">{r.currentAqi || '—'}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F0F5EE] text-[#404943] border border-[#E9EDE9]">
                        {r.severity || 'Recorded'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#DC2626] font-semibold">{r.pm25 ?? '—'}</td>
                    <td className="py-2.5 px-3 text-[#D97706]">{r.pm10 ?? '—'}</td>
                    <td className="py-2.5 px-3 text-[#2563EB]">{r.no2 ?? '—'}</td>
                    <td className="py-2.5 px-3 text-[#055237]">{r.windSpeed ? `${r.windSpeed} m/s` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
