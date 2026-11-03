import React, { useState, useEffect } from 'react';
import { pollutantApi } from '../../api/pollutant.api';
import { KpiCard } from '../../components/cards/KpiCard';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import { Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const PollutantsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, tr] = await Promise.all([
        pollutantApi.getSummary(),
        pollutantApi.getTrends(),
      ]);
      setSummary(sum);
      setTrends(tr);
    } catch (err: any) {
      setError(err.message || 'Failed to load pollutant data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (error || !summary) {
    return <ErrorState message={error || 'Error'} onRetry={fetchData} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-mono text-[11px] font-semibold">
              <Activity className="w-3.5 h-3.5" />
              MULTI-VECTOR AMBIENT TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            Pollutant Analytics & Chemical Precursors
          </h1>
          <p className="text-xs text-[#737B75]">
            Comprehensive multi-pollutant metrics covering particulate matter, nitrogen oxides, sulphur dioxide, carbon monoxide, and tropospheric ozone.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="PM2.5 / PM10 Ratio"
          value={summary.pmRatio || '0.52'}
          unit="Fine Fraction"
          subtext="Combustion vs fugitive dust indicator"
          badge={<Activity className="w-4 h-4 text-[#055237]" />}
          footerLeft={<span className="font-mono text-[#055237] font-semibold">Combustion Dominated</span>}
          footerRight="Ratio > 0.50"
        />

        <KpiCard
          label="Mean NO2 Concentration"
          value={summary.mean_no2 || '38.4'}
          unit="µg/m³"
          subtext="NAAQS Std: 80.0 µg/m³"
          badge={<Activity className="w-4 h-4 text-[#BA6828]" />}
          footerLeft={<span className="font-mono text-[#055237] font-semibold">Within Standard</span>}
          footerRight={`Max: ${summary.max_no2} µg/m³`}
        />

        <KpiCard
          label="Mean SO2 Concentration"
          value={summary.mean_so2 || '14.2'}
          unit="µg/m³"
          subtext="NAAQS Std: 80.0 µg/m³"
          badge={<Activity className="w-4 h-4 text-[#055237]" />}
          footerLeft={<span className="font-mono text-[#055237] font-semibold">Low Industrial Load</span>}
          footerRight={`Max: ${summary.max_so2} µg/m³`}
        />

        <KpiCard
          label="Mean Ozone (O3)"
          value={summary.mean_ozone || '32.1'}
          unit="µg/m³"
          subtext="NAAQS Std: 100.0 µg/m³"
          badge={<Activity className="w-4 h-4 text-[#E5B94F]" />}
          footerLeft={<span className="font-mono text-[#BA6828] font-semibold">Photochemical Activity</span>}
          footerRight={`Max: ${summary.max_ozone} µg/m³`}
        />
      </div>

      {/* Pollutant Trends Chart */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
          <div>
            <h2 className="text-base font-semibold text-[#202521]">Multi-Pollutant Trajectory (60-Day Chronology)</h2>
            <p className="text-xs text-[#737B75]">
              Co-evolution of fine particulate matter alongside nitrogen oxides and ozone
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[#737B75]">
            <span className="flex items-center gap-1">
              <span className="w-3 h-1 bg-[#055237] rounded-full"></span> PM2.5
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-1 bg-[#BA6828] rounded-full"></span> NO2
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-1 bg-[#E5B94F] rounded-full"></span> Ozone
            </span>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#737B75' }} tickLine={false} axisLine={{ stroke: '#E9EDE9' }} />
              <YAxis tick={{ fontSize: 10, fill: '#737B75' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="pm25" stroke="#055237" strokeWidth={2} dot={false} name="PM2.5 (µg/m³)" />
              <Line type="monotone" dataKey="no2" stroke="#BA6828" strokeWidth={1.5} dot={false} name="NO2 (µg/m³)" />
              <Line type="monotone" dataKey="ozone" stroke="#E5B94F" strokeWidth={1.5} dot={false} name="Ozone (µg/m³)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

