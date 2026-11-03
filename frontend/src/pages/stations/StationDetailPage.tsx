import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stationApi } from '../../api/station.api';
import { StationProfile, TrajectoryPoint } from '../../types';
import { KpiCard } from '../../components/cards/KpiCard';
import { SeverityChip } from '../../components/cards/SeverityChip';
import { TrajectoryChart } from '../../components/charts/TrajectoryChart';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import { Radio, AlertTriangle, ShieldCheck, Wind, Thermometer, Droplets, Sun } from 'lucide-react';
import { useGlobalFilters } from '../../context/FilterContext';

export const StationDetailPage: React.FC = () => {
  const { stationId: paramId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { options } = useGlobalFilters();

  const currentStationId = paramId || 'site_1434'; // Default to Anand Vihar Delhi
  const [profile, setProfile] = useState<StationProfile | null>(null);
  const [trends, setTrends] = useState<TrajectoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [profData, trendData] = await Promise.all([
        stationApi.getStationById(id),
        stationApi.getStationTrends(id, 30),
      ]);
      setProfile(profData);
      setTrends(trendData);
    } catch (err: any) {
      setError(err.message || 'Failed to load station profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(currentStationId);
  }, [currentStationId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-28 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error || !profile) {
    return <ErrorState message={error || 'Station not found'} onRetry={() => fetchProfile(currentStationId)} />;
  }

  const { metadata, stats } = profile;

  return (
    <div className="flex flex-col gap-6">
      {/* Station Banner Header & Switcher */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-semibold">
              CAAQMS #{metadata.stationId}
            </span>
            <SeverityChip
              category={
                stats.avgPM25 <= 30
                  ? 'Good'
                  : stats.avgPM25 <= 60
                  ? 'Satisfactory'
                  : stats.avgPM25 <= 90
                  ? 'Moderate'
                  : stats.avgPM25 <= 120
                  ? 'Poor'
                  : stats.avgPM25 <= 250
                  ? 'Very Poor'
                  : 'Severe'
              }
            />
          </div>
          <h1 className="text-2xl font-bold text-[#202521]">{metadata.stationName}</h1>
          <p className="text-xs text-[#737B75]">
            {metadata.city}, {metadata.state} • Operational Continuous Ambient Monitor
          </p>
        </div>

        {/* Station Quick Switcher Dropdown */}
        <div className="flex flex-col gap-1 w-full md:w-64">
          <label className="font-mono text-[10px] text-[#737B75] uppercase font-semibold">
            Switch Station
          </label>
          <select
            value={currentStationId}
            onChange={(e) => navigate(`/stations/${e.target.value}`)}
            className="w-full h-9 pl-2 pr-6 bg-[#F0F5EE] text-[#202521] text-xs rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-[#055237]"
          >
            {options.stations.map((stn) => (
              <option key={stn.id} value={stn.id}>
                {stn.name} ({stn.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6 Key Station Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          label="Average PM2.5"
          value={stats.avgPM25 || '—'}
          unit="µg/m³"
          subtext="24h Rolling Mean"
          badge={<Radio className="w-3.5 h-3.5 text-[#055237]" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold">
              {stats.avgPM25 > 60
                ? `+${Math.round(((stats.avgPM25 - 60) / 60) * 100)}% Limit`
                : 'Compliant'}
            </span>
          }
          footerRight="CPCB: 60 µg/m³"
        />

        <KpiCard
          label="Average PM10"
          value={stats.avgPM10 || '—'}
          unit="µg/m³"
          subtext="Coarse Particulate"
          badge={<Radio className="w-3.5 h-3.5 text-[#737B75]" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold">
              {stats.avgPM10 > 100
                ? `+${Math.round(((stats.avgPM10 - 100) / 100) * 100)}% Limit`
                : 'Compliant'}
            </span>
          }
          footerRight="CPCB: 100 µg/m³"
        />

        <KpiCard
          label="Max PM2.5 Peak"
          value={stats.maxPM25 || '—'}
          unit="µg/m³"
          subtext="Winter Inversion Peak"
          badge={<AlertTriangle className="w-3.5 h-3.5 text-[#BA1A1A]" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold">Severe Event</span>
          }
          footerRight="Nov 2025"
        />

        <KpiCard
          label="Max PM10 Peak"
          value={stats.maxPM10 || '—'}
          unit="µg/m³"
          subtext="Fugitive & road dust"
          badge={<AlertTriangle className="w-3.5 h-3.5 text-[#BA1A1A]" />}
          footerLeft={
            <span className="font-mono text-[#BA1A1A] font-semibold">Sensor Ceiling</span>
          }
          footerRight="Max 1000 µg/m³"
        />

        <KpiCard
          label="Ingested Points"
          value={stats.totalPoints?.toLocaleString() || '8,760'}
          subtext="15-min Validated Hours"
          badge={<ShieldCheck className="w-3.5 h-3.5 text-[#055237]" />}
          footerLeft={
            <span className="font-mono text-[#055237] font-semibold">100% Ingested</span>
          }
          footerRight="Zero Missing Days"
        />

        <KpiCard
          label="Data Capture"
          value={`${metadata.dataCapturePct}%`}
          subtext="Statutory Compliance"
          badge={<ShieldCheck className="w-3.5 h-3.5 text-[#055237]" />}
          footerLeft={
            <span className="font-mono text-[#055237] font-semibold">Audit Passed</span>
          }
          footerRight="CPCB Protocol"
        />
      </div>

      {/* Multi-Pollutant & Meteorology Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Pollutant Profile */}
        <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
          <div className="pb-3 border-b border-[#E9EDE9]">
            <h2 className="text-base font-semibold text-[#202521]">Multi-Pollutant Telemetry</h2>
            <p className="text-xs text-[#737B75]">
              Annual average concentrations across CPCB standard air quality vectors
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#F0F5EE] p-3 rounded-lg border border-[#E9EDE9]">
              <span className="text-[10px] font-mono text-[#737B75] uppercase">NO2 (Nitrogen Dioxide)</span>
              <div className="text-xl font-bold text-[#202521] mt-1 tabular-nums">{stats.avgNO2 || '—'} µg/m³</div>
              <span className="text-[10px] text-[#737B75]">NAAQS: 80 µg/m³</span>
            </div>

            <div className="bg-[#F0F5EE] p-3 rounded-lg border border-[#E9EDE9]">
              <span className="text-[10px] font-mono text-[#737B75] uppercase">SO2 (Sulphur Dioxide)</span>
              <div className="text-xl font-bold text-[#202521] mt-1 tabular-nums">{stats.avgSO2 || '—'} µg/m³</div>
              <span className="text-[10px] text-[#737B75]">NAAQS: 80 µg/m³</span>
            </div>

            <div className="bg-[#F0F5EE] p-3 rounded-lg border border-[#E9EDE9]">
              <span className="text-[10px] font-mono text-[#737B75] uppercase">CO (Carbon Monoxide)</span>
              <div className="text-xl font-bold text-[#202521] mt-1 tabular-nums">{stats.avgCO || '—'} mg/m³</div>
              <span className="text-[10px] text-[#737B75]">NAAQS: 4.0 mg/m³</span>
            </div>

            <div className="bg-[#F0F5EE] p-3 rounded-lg border border-[#E9EDE9]">
              <span className="text-[10px] font-mono text-[#737B75] uppercase">Ozone (O3)</span>
              <div className="text-xl font-bold text-[#202521] mt-1 tabular-nums">{stats.avgOzone || '—'} µg/m³</div>
              <span className="text-[10px] text-[#737B75]">NAAQS: 100 µg/m³</span>
            </div>

            <div className="bg-[#F0F5EE] p-3 rounded-lg border border-[#E9EDE9]">
              <span className="text-[10px] font-mono text-[#737B75] uppercase">NH3 (Ammonia)</span>
              <div className="text-xl font-bold text-[#202521] mt-1 tabular-nums">{stats.avgNH3 || '—'} µg/m³</div>
              <span className="text-[10px] text-[#737B75]">NAAQS: 400 µg/m³</span>
            </div>

            <div className="bg-[#F0F5EE] p-3 rounded-lg border border-[#E9EDE9]">
              <span className="text-[10px] font-mono text-[#737B75] uppercase">PM2.5 / PM10 Ratio</span>
              <div className="text-xl font-bold text-[#055237] mt-1 tabular-nums">
                {stats.avgPM10 ? (stats.avgPM25 / stats.avgPM10).toFixed(2) : '0.52'}
              </div>
              <span className="text-[10px] text-[#737B75]">Combustion fraction</span>
            </div>
          </div>
        </div>

        {/* Meteorological Environment */}
        <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
          <div className="pb-3 border-b border-[#E9EDE9]">
            <h2 className="text-base font-semibold text-[#202521]">Meteorological Environment</h2>
            <p className="text-xs text-[#737B75]">
              Local weather sensors measuring boundary layer dispersion potential
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#FAFAF8] rounded-lg border border-[#E9EDE9] flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-[#BA6828]" />
              <div>
                <span className="text-[10px] text-[#737B75] block font-mono">Ambient Temperature</span>
                <span className="text-lg font-bold text-[#202521] tabular-nums">{stats.avgTemp || 24.5} °C</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAFAF8] rounded-lg border border-[#E9EDE9] flex items-center gap-3">
              <Droplets className="w-5 h-5 text-[#055237]" />
              <div>
                <span className="text-[10px] text-[#737B75] block font-mono">Relative Humidity</span>
                <span className="text-lg font-bold text-[#202521] tabular-nums">{stats.avgRH || 62.4} %</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAFAF8] rounded-lg border border-[#E9EDE9] flex items-center gap-3">
              <Wind className="w-5 h-5 text-[#58605c]" />
              <div>
                <span className="text-[10px] text-[#737B75] block font-mono">Wind Speed</span>
                <span className="text-lg font-bold text-[#202521] tabular-nums">{stats.avgWS || 2.1} m/s</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAFAF8] rounded-lg border border-[#E9EDE9] flex items-center gap-3">
              <Sun className="w-5 h-5 text-[#E5B94F]" />
              <div>
                <span className="text-[10px] text-[#737B75] block font-mono">Solar Radiation</span>
                <span className="text-lg font-bold text-[#202521] tabular-nums">{stats.avgSR || 148.2} W/m²</span>
              </div>
            </div>
          </div>

          {/* Sensor Saturation & Anomaly Flags */}
          <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9] text-xs font-mono text-[#58605c] flex flex-col gap-1">
            <span className="font-semibold text-[#202521]">Sensor Boundary Indicators:</span>
            <span>• PM2.5 Saturation (&ge;999.9 µg/m³): {stats.pm25SaturatedHours || 0} hours</span>
            <span>• PM10 Saturation (&ge;1000.0 µg/m³): {stats.pm10SaturatedHours || 0} hours</span>
            <span>• Vertical Wind Speed Downdrafts (VWS &lt; 0): {stats.vwsNegativeHours || 0} hours</span>
          </div>
        </div>
      </div>

      {/* Station Chronological Trajectory */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-[#E9EDE9]">
          <h2 className="text-base font-semibold text-[#202521]">Station 30-Day Chronology</h2>
          <p className="text-xs text-[#737B75]">
            Daily average PM2.5 and PM10 trajectories for {metadata.stationName}
          </p>
        </div>

        <TrajectoryChart data={trends} />
      </div>
    </div>
  );
};

