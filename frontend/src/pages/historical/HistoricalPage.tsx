import React, { useState, useEffect } from 'react';
import { historicalApi } from '../../api/historical.api';
import { HistoricalSummary } from '../../types';
import { KpiCard } from '../../components/cards/KpiCard';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import { History, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const HistoricalPage: React.FC = () => {
  const [summary, setSummary] = useState<HistoricalSummary | null>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([historicalApi.getSummary(), historicalApi.getDistribution()])
      .then(([sum, dist]) => {
        setSummary(sum);
        setDistribution(dist);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (error || !summary) {
    return <ErrorState message={error || 'Failed to load historical data'} />;
  }

  const { overview, yearlyTrends } = summary;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-mono text-[11px] font-semibold">
              <History className="w-3.5 h-3.5" />
              LONGITUDINAL ARCHIVE (2017–2023)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            Historical AQI Chronology & Longitudinal Baseline
          </h1>
          <p className="text-xs text-[#737B75]">
            Multi-year official CPCB-published Air Quality Index records covering 7 full calendar years.
          </p>
        </div>
      </div>

      {/* Historical KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          label="Total Historical Observations"
          value={overview.totalObservations.toLocaleString()}
          subtext="Valid hourly AQI values (7.07% null)"
          badge={<History className="w-4 h-4 text-[#055237]" />}
          footerLeft={<span className="font-mono text-[#055237] font-semibold">2,291,589 Clean Reads</span>}
          footerRight="2017 - 2023"
        />

        <KpiCard
          label="7-Year Longitudinal Mean AQI"
          value={overview.overallMeanAQI}
          unit="AQI"
          subtext="Basin-wide multi-year average"
          badge={<Calendar className="w-4 h-4 text-[#BA6828]" />}
          footerLeft={<span className="font-mono text-[#BA6828] font-semibold">Moderate Exposure</span>}
          footerRight="NAAQS Baseline"
        />

        <KpiCard
          label="Canonical Historical Nodes"
          value={overview.stationCount}
          unit="Stations"
          subtext="Verified North Indian CAAQMS"
          badge={<CheckCircle2 className="w-4 h-4 text-[#055237]" />}
          footerLeft={<span className="font-mono text-[#055237] font-semibold">Disambiguated</span>}
          footerRight="37 Out-of-region Excluded"
        />
      </div>

      {/* Year-by-Year Trend Bar Chart */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-[#E9EDE9]">
          <h2 className="text-base font-semibold text-[#202521]">
            Annualized Mean AQI Trajectory (2017–2023)
          </h2>
          <p className="text-xs text-[#737B75]">
            Long-term macro air quality progression across Northern India
          </p>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#E9EDE9' }} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="meanAQI" fill="#055237" radius={[4, 4, 0, 0]} name="Mean AQI" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Integrity Callout */}
      <div className="p-4 bg-[#EAF3ED] border border-[#055237]/20 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#055237] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-xs text-[#055237]">
            Crucial Scientific Boundary Principle
          </span>
          <p className="text-xs text-[#404943] leading-relaxed">
            Historical AQI records (2017–2023) represent published daily composite indices and are strictly partitioned from 2025 raw hourly pollutant concentrations. They must never be concatenated into a single deceptive continuous time series.
          </p>
        </div>
      </div>
    </div>
  );
};

