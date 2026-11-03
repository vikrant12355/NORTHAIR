import React from 'react';
import { useOverview } from '../../hooks/useOverview';
import { useStations } from '../../hooks/useStations';
import { KpiCard } from '../../components/cards/KpiCard';
import { SeverityChip } from '../../components/cards/SeverityChip';
import { TrajectoryChart } from '../../components/charts/TrajectoryChart';
import { StateBarChart } from '../../components/charts/StateBarChart';
import { StationTable } from '../../components/tables/StationTable';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import { CheckCircle2, Database, TrendingUp, Sparkles, PieChart } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { summary, trends, regionalComparison, loading, error, refetch } = useOverview();
  const { stations, loading: stationsLoading } = useStations();

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !summary) {
    return <ErrorState message={error || 'Unable to load overview telemetry'} onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#055237] animate-pulse"></span>
              NORTHERN BASIN TELEMETRY
            </span>
            <span className="text-[#737B75] text-[11px] font-mono">CYCLE 2025.Q1-Q4</span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            North India Air Quality Overview
          </h1>
          <p className="text-xs text-[#737B75]">
            Continuous ambient air telemetry and atmospheric load dynamics across 48 accredited CAAQMS
            stations in Chandigarh, Punjab, Haryana, and Delhi NCT.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-[#737B75]">
          <span className="flex items-center gap-1 text-[#055237] font-semibold">
            <CheckCircle2 className="w-4 h-4" /> CPCB / SPCB Validated
          </span>
          <span className="text-[#E9EDE9]">|</span>
          <span>24h Rolling Mean</span>
        </div>
      </div>

      {/* 2. Six Scientific KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <KpiCard
          label="Stations Online"
          value={summary.stationsOnline}
          unit="/ 48 Active"
          subtext="CAAQMS Telemetry Nodes"
          badge={<span className="w-2 h-2 rounded-full bg-[#055237]" />}
          footerLeft={
            <span className="inline-flex items-center gap-1 font-mono text-[#055237] font-semibold">
              <CheckCircle2 className="w-3 h-3" /> 100% Active
            </span>
          }
          footerRight="Audit Passed"
        />

        {/* KPI 2 */}
        <KpiCard
          label="Telemetry Points"
          value={summary.totalTelemetryPoints.toLocaleString()}
          subtext="Validated hourly points"
          badge={<Database className="w-3.5 h-3.5 text-[#737B75]" />}
          footerLeft={
            <span className="font-mono text-[#737B75] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#055237]" /> Live ingested
            </span>
          }
          footerRight="100% Validated"
        />

        {/* KPI 3 */}
        <KpiCard
          label="Reg. Mean PM2.5"
          value={summary.regionalMeanPM25}
          unit="µg/m³"
          subtext={`NAAQS Std: ${summary.naaqsPM25Std} µg/m³`}
          badge={<SeverityChip category="Moderate" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{summary.pm25ExceedancePct}% limit
            </span>
          }
          footerRight="24h Basin Avg"
        />

        {/* KPI 4 */}
        <KpiCard
          label="Reg. Mean PM10"
          value={summary.regionalMeanPM10}
          unit="µg/m³"
          subtext={`NAAQS Std: ${summary.naaqsPM10Std} µg/m³`}
          badge={<SeverityChip category="Moderate" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{summary.pm10ExceedancePct}% limit
            </span>
          }
          footerRight="Coarse particulate"
        />

        {/* KPI 5 */}
        <KpiCard
          label="Peak Max PM2.5"
          value={summary.peakRecord.value}
          unit="µg/m³"
          subtext={summary.peakRecord.stationName}
          badge={<SeverityChip category="Severe" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold">
              6.5× Standard
            </span>
          }
          footerRight="Inversion Peak"
        />

        {/* KPI 6 */}
        <KpiCard
          label="Completeness"
          value={`${summary.completenessPct}%`}
          subtext="Statutory threshold >85%"
          badge={<CheckCircle2 className="w-3.5 h-3.5 text-[#055237]" />}
          footerLeft={
            <span className="font-mono text-[#055237] font-semibold">High Fidelity</span>
          }
          footerRight="ISO 17025 Cal"
        />
      </section>

      {/* 3. Primary Visualisation Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Dual Series Trajectory */}
          <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[#202521]">
                    Longitudinal Particulate Trajectory
                  </h2>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#F0F5EE] text-[#737B75] font-semibold">
                    30-Day Chronology
                  </span>
                </div>
                <p className="text-xs text-[#737B75]">
                  Cross-state daily average comparing PM2.5 vs. PM10 against National Ambient Air
                  Quality Standards (NAAQS)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-[#737B75]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#055237] rounded-full"></span> PM2.5 (Fine)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#707973] rounded-full"></span> PM10 (Coarse)
                </span>
              </div>
            </div>

            <TrajectoryChart data={trends} />

            <div className="p-3 bg-[#F0F5EE] rounded-lg flex items-center justify-between text-xs text-[#58605c]">
              <span>
                Episodic peaks correlate with winter anticyclonic surface temperature inversions
                across the Indo-Gangetic Basin.
              </span>
              <span className="font-mono text-[10px] text-[#055237] font-semibold">
                Daily Mean Telemetry
              </span>
            </div>
          </div>

          {/* Regional State Comparison */}
          <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDE9]">
              <div>
                <h2 className="text-base font-semibold text-[#202521]">
                  State-by-State Exposure Disparity
                </h2>
                <p className="text-xs text-[#737B75]">
                  Mean ambient particulate concentration clustered across participating administrative territories
                </p>
              </div>
              <span className="font-mono text-[10px] px-2 py-1 rounded bg-[#F0F5EE] text-[#737B75] font-semibold">
                CPCB Standard Tier
              </span>
            </div>

            <StateBarChart data={regionalComparison} />
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="flex flex-col gap-6">
          {/* Air Quality Tiers Stack */}
          <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDE9]">
              <div>
                <h2 className="text-base font-semibold text-[#202521]">Air Quality Tiers</h2>
                <p className="text-xs text-[#737B75]">
                  2025 Validated Sample Distribution (N=414,255)
                </p>
              </div>
              <PieChart className="w-4 h-4 text-[#737B75]" />
            </div>

            <div className="flex flex-col gap-3">
              {summary.airQualityTiers.map((tier) => {
                let barColor = 'bg-[#26966B]';
                if (tier.category === 'Satisfactory') barColor = 'bg-[#8EBB56]';
                if (tier.category === 'Moderate') barColor = 'bg-[#E5B94F]';
                if (tier.category === 'Poor') barColor = 'bg-[#E58B38]';
                if (tier.category === 'Very Poor') barColor = 'bg-[#D85D43]';
                if (tier.category === 'Severe') barColor = 'bg-[#BA1A1A]';

                return (
                  <div key={tier.category} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="flex items-center gap-1.5 text-[#202521]">
                        <span className={`w-2 h-2 rounded-sm ${barColor}`} />
                        {tier.category}
                      </span>
                      <span className="font-semibold text-[#202521]">
                        {tier.percentage}%{' '}
                        <span className="text-[#737B75] font-normal">
                          ({(tier.count / 1000).toFixed(0)}k)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-[#F0F5EE] h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor}`} style={{ width: `${tier.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#E9EDE9] flex items-center justify-between text-xs font-mono text-[#737B75]">
              <span>Critical Exceedance Factor</span>
              <span className="text-[#BA1A1A] font-bold">27.6% Above Standard</span>
            </div>
          </div>

          {/* Analytical Discoveries */}
          <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDE9]">
              <h2 className="text-base font-semibold text-[#202521] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#055237]" />
                Analytical Discoveries
              </h2>
              <span className="font-mono text-[10px] text-[#055237] font-semibold bg-[#EAF3ED] px-2 py-0.5 rounded-full">
                EMPIRICAL SYNTHESIS
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {summary.findings.map((f) => (
                <div
                  key={f.id}
                  className="p-3 bg-[#F0F5EE] rounded-xl flex flex-col gap-1 hover:bg-[#E5E9E3] transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-[#055237]">
                    <span>{f.id} • {f.tag}</span>
                    {f.correlation && <span className="text-[#737B75]">Corr {f.correlation}</span>}
                    {f.variance && <span className="text-[#737B75]">{f.variance}</span>}
                  </div>
                  <h3 className="text-xs font-bold text-[#202521]">{f.title}</h3>
                  <p className="text-[11px] text-[#58605c] leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Top Monitoring Stations Table */}
      <StationTable stations={stations} />
    </div>
  );
};

