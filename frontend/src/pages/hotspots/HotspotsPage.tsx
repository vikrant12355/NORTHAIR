import React from 'react';
import { useHotspots } from '../../hooks/useHotspots';
import { KpiCard } from '../../components/cards/KpiCard';
import { SeverityChip } from '../../components/cards/SeverityChip';
import { HeatmapMatrix } from '../../components/charts/HeatmapMatrix';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import { Flame, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HotspotsPage: React.FC = () => {
  const { rankings, heatmap, loading, error, refetch } = useHotspots();

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const topHotspot = rankings[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#BA1A1A]/10 text-[#BA1A1A] font-mono text-[11px] font-semibold">
              <Flame className="w-3.5 h-3.5" />
              HOTSPOT DETECTION ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            Pollution Hotspot Explorer & Exceedance Rankings
          </h1>
          <p className="text-xs text-[#737B75]">
            Multi-criteria prioritization identifying chronic epicenters and seasonal exceedance intensity across 48 CAAQMS nodes.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          label="Top Chronic Hotspot"
          value={topHotspot?.stationName || 'Anand Vihar'}
          subtext={`${topHotspot?.city}, ${topHotspot?.state}`}
          badge={<SeverityChip category="Severe" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold">
              Rank #01 Composite
            </span>
          }
          footerRight={`Mean: ${topHotspot?.pm25Mean} µg/m³`}
        />
        <KpiCard
          label="Chronic Exceedance Multiple"
          value="4.6×"
          unit="NAAQS limit"
          subtext="Winter 90th percentile ceiling"
          badge={<AlertTriangle className="w-4 h-4 text-[#BA1A1A]" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold">
              P90: {topHotspot?.pm25P90} µg/m³
            </span>
          }
          footerRight="Statutory 60 µg/m³"
        />
        <KpiCard
          label="Severe Hazard Stations"
          value={rankings.filter((r) => r.pm25Mean > 90).length}
          unit="/ 48 Stations"
          subtext="Annualized mean exceeding 90 µg/m³"
          badge={<ShieldAlert className="w-4 h-4 text-[#BA6828]" />}
          footerLeft={
            <span className="font-mono text-[#BA6828] font-semibold">Action Required</span>
          }
          footerRight="Indo-Gangetic Corridor"
        />
      </div>

      {/* Annual & Monthly Station Hotspot Heatmap Matrix */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
          <div>
            <h2 className="text-base font-semibold text-[#202521]">
              Annual & Monthly Telemetry Heatmap Matrix
            </h2>
            <p className="text-xs text-[#737B75]">
              Month-by-month mean PM2.5 concentrations color-coded by international CPCB severity tiers
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#737B75]">
            <span className="w-2.5 h-2.5 rounded bg-[#26966B]"></span> Good
            <span className="w-2.5 h-2.5 rounded bg-[#8EBB56] ml-1"></span> Sat
            <span className="w-2.5 h-2.5 rounded bg-[#E5B94F] ml-1"></span> Mod
            <span className="w-2.5 h-2.5 rounded bg-[#E58B38] ml-1"></span> Poor
            <span className="w-2.5 h-2.5 rounded bg-[#BA1A1A] ml-1"></span> V.Poor
            <span className="w-2.5 h-2.5 rounded bg-[#5C0A0A] ml-1"></span> Severe
          </div>
        </div>

        <HeatmapMatrix data={heatmap} limit={16} />
      </div>

      {/* Multi-Criteria Hotspot Ranking Table */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-[#E9EDE9]">
          <h2 className="text-base font-semibold text-[#202521]">
            Multi-Criteria Hotspot Priority Rankings
          </h2>
          <p className="text-xs text-[#737B75]">
            Ranked by composite score weighting Mean PM2.5, 90th percentile peaks, and regulatory exceedance frequency
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F5EE] border-b border-[#E9EDE9] font-mono text-[10px] text-[#737B75] uppercase">
                <th className="py-2.5 px-3">Hotspot Rank</th>
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">City / State</th>
                <th className="py-2.5 px-3 text-right">Mean PM2.5</th>
                <th className="py-2.5 px-3 text-right">90th %ile PM2.5</th>
                <th className="py-2.5 px-3 text-right">Mean PM10</th>
                <th className="py-2.5 px-3 text-center">Exceedance (&gt;60 µg/m³)</th>
                <th className="py-2.5 px-3 text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#E9EDE9]">
              {rankings.map((stn) => (
                <tr key={stn.stationId} className="hover:bg-[#F0F5EE]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#055237]">
                    #{stn.compositeRank < 10 ? `0${stn.compositeRank}` : stn.compositeRank}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#202521]">
                    <Link to={`/stations/${stn.stationId}`} className="hover:underline">
                      {stn.stationName}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-[#737B75]">
                    {stn.city}, {stn.state}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-[#202521]">
                    {stn.pm25Mean} µg/m³
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#BA1A1A] font-semibold tabular-nums">
                    {stn.pm25P90} µg/m³
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#737B75] tabular-nums">
                    {stn.pm10Mean} µg/m³
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-[#BA1A1A] tabular-nums">
                    {stn.exceed60Pct}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <SeverityChip
                      category={
                        stn.pm25Mean <= 30
                          ? 'Good'
                          : stn.pm25Mean <= 60
                          ? 'Satisfactory'
                          : stn.pm25Mean <= 90
                          ? 'Moderate'
                          : stn.pm25Mean <= 120
                          ? 'Poor'
                          : 'Very Poor'
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
