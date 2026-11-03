import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/analytics.api';
import { KpiCard } from '../../components/cards/KpiCard';
import { DiurnalChart } from '../../components/charts/DiurnalChart';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import { Clock, Sun, Moon, Waves, Car } from 'lucide-react';
import { useGlobalFilters } from '../../context/FilterContext';

export const DiurnalPage: React.FC = () => {
  const { filters } = useGlobalFilters();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiurnal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDiurnal(filters.state);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load diurnal curve');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiurnal();
  }, [filters.state]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDiurnal} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-mono text-[11px] font-semibold">
              <Clock className="w-3.5 h-3.5" />
              IST TIME ZONE (UTC+05:30)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            Diurnal Cycle Explorer & Boundary Layer Dynamics
          </h1>
          <p className="text-xs text-[#737B75]">
            24-hour continuous cyclic telemetry profiling fine particulate concentration against solar convective mixing and nocturnal inversion.
          </p>
        </div>
      </div>

      {/* 4 Diurnal Scientific KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Nocturnal Inversion Peak"
          value="114.2"
          unit="µg/m³"
          subtext="21:00 - 23:00 IST Night Peak"
          badge={<Moon className="w-4 h-4 text-[#BA1A1A]" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold">
              Ground Inversion
            </span>
          }
          footerRight="Shallow boundary lid"
        />

        <KpiCard
          label="Midday Dispersion Trough"
          value="58.2"
          unit="µg/m³"
          subtext="13:00 - 16:00 IST Solar Optimum"
          badge={<Sun className="w-4 h-4 text-[#055237]" />}
          footerLeft={
            <span className="font-mono text-[#055237] font-semibold">
              Optimal Ventilation
            </span>
          }
          footerRight="Thermal mixing >1350m"
        />

        <KpiCard
          label="Morning Rush Exceedance"
          value="98.5"
          unit="µg/m³"
          subtext="07:00 - 09:00 IST Surge"
          badge={<Car className="w-4 h-4 text-[#BA6828]" />}
          footerLeft={
            <span className="font-mono text-[#BA6828] font-semibold">
              +69% over Trough
            </span>
          }
          footerRight="Cold start fleet drag"
        />

        <KpiCard
          label="Diurnal Amplitude Index"
          value="3.03×"
          unit="Peak-to-Trough"
          subtext="Nocturnal vs Midday ratio"
          badge={<Waves className="w-4 h-4 text-[#055237]" />}
          footerLeft={
            <span className="font-mono text-[#055237] font-semibold">Class IV Trap</span>
          }
          footerRight="Severe winter swing"
        />
      </div>

      {/* 24-Hour Diurnal Curve Chart */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
          <div>
            <h2 className="text-base font-semibold text-[#202521]">
              24-Hour Mean Atmospheric Curve & Dispersion Dynamics
            </h2>
            <p className="text-xs text-[#737B75]">
              Mean PM2.5 trajectory (solid line) and PM10 (dashed line) plotted across 24 hourly steps in Indian Standard Time (IST)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[#737B75]">
            <span className="flex items-center gap-1">
              <span className="w-3 h-1 bg-[#055237] rounded-full"></span> PM2.5
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-1 bg-[#707973] rounded-full"></span> PM10
            </span>
          </div>
        </div>

        <DiurnalChart data={data} />

        <div className="p-3 bg-[#F0F5EE] rounded-lg text-xs text-[#58605c] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            <b>Atmospheric Science Note:</b> Midday depression is caused by solar heating of the surface driving vertical convective turbulence that dilutes surface particulates into a deeper planetary boundary layer.
          </span>
          <span className="font-mono text-[10px] text-[#055237] shrink-0 font-semibold">
            IST Verified
          </span>
        </div>
      </div>
    </div>
  );
};

