import React, { useState, useEffect } from 'react';
import { pollutantApi } from '../../api/pollutant.api';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import { Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ZAxis,
} from 'recharts';

export const RelationshipsPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pollutantApi
      .getRelationships()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-mono text-[11px] font-semibold">
              <Layers className="w-3.5 h-3.5" />
              PHOTOCHEMICAL & VECTOR TITRATION
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            Pollutant Relationship Lab
          </h1>
          <p className="text-xs text-[#737B75]">
            Empirical regressions and cross-pollutant dynamics across fine particulate and gaseous fractions.
          </p>
        </div>
      </div>

      {/* PM2.5 vs PM10 Scatter */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-[#E9EDE9]">
          <h2 className="text-base font-semibold text-[#202521]">PM2.5 vs PM10 Co-Dispersion Scatter</h2>
          <p className="text-xs text-[#737B75]">
            Stratified sample showing strong linear coupling (r &gt; 0.85) between fine and coarse aerosol fractions
          </p>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
              <XAxis type="number" dataKey="pm10" name="PM10" unit=" µg/m³" tick={{ fontSize: 10 }} />
              <YAxis type="number" dataKey="pm25" name="PM2.5" unit=" µg/m³" tick={{ fontSize: 10 }} />
              <ZAxis range={[20, 20]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Particulate Telemetry" data={data} fill="#055237" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
