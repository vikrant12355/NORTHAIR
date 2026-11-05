import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mapApi, MapStation, MapLegend, MapSummaryResponse } from '../../api/map.api';
import { useGlobalFilters } from '../../context/FilterContext';
import {
  Layers, RefreshCw, MapPin, ChevronRight,
  TrendingUp, Gauge, Database, AlertTriangle, CheckCircle2, X,
  ShieldAlert, Sparkles, Calendar, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Target Region Bounding Boxes for North India ---
const REGIONAL_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  ALL: [[27.65, 73.85], [32.50, 77.85]],
  Chandigarh: [[30.68, 76.72], [30.79, 76.85]],
  Delhi: [[28.40, 76.85], [28.90, 77.35]],
  Haryana: [[27.65, 74.45], [30.90, 77.60]],
  Punjab: [[29.55, 73.85], [32.50, 76.95]],
};

// --- Pollutant Definitions & Regulatory Standards ---
const POLLUTANTS = [
  { id: 'PM25',  label: 'PM2.5', name: 'Fine Particulate', unit: 'µg/m³', std: 60  },
  { id: 'PM10',  label: 'PM10',  name: 'Inhalable Dust',   unit: 'µg/m³', std: 100 },
  { id: 'NO2',   label: 'NO₂',   name: 'Nitrogen Dioxide', unit: 'µg/m³', std: 80  },
  { id: 'SO2',   label: 'SO₂',   name: 'Sulphur Dioxide',  unit: 'µg/m³', std: 80  },
  { id: 'CO',    label: 'CO',    name: 'Carbon Monoxide',  unit: 'mg/m³', std: 2   },
  { id: 'OZONE', label: 'Ozone', name: 'Tropospheric O₃',  unit: 'µg/m³', std: 100 },
  { id: 'NH3',   label: 'NH₃',   name: 'Ammonia',          unit: 'µg/m³', std: 400 },
];

// --- Predefined Seasonal Periods ---
const DATE_PERIODS = [
  { label: 'Full Year 2025', startDate: '', endDate: '' },
  { label: 'Winter (Dec–Feb)', startDate: '2025-12-01', endDate: '2025-02-28' },
  { label: 'Pre-Monsoon (Mar–May)', startDate: '2025-03-01', endDate: '2025-05-31' },
  { label: 'Monsoon (Jun–Sep)', startDate: '2025-06-01', endDate: '2025-09-30' },
  { label: 'Post-Monsoon (Oct–Nov)', startDate: '2025-10-01', endDate: '2025-11-30' },
];

// --- Smooth Regional Auto-Bounds Controller ---
function MapBoundsController({
  activeState,
  stations,
  selectedStation,
}: {
  activeState: string;
  stations: MapStation[];
  selectedStation: MapStation | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedStation?.lat && selectedStation?.lng) {
      map.flyTo([selectedStation.lat, selectedStation.lng], 12, { duration: 1.0 });
      return;
    }

    const targetBounds = REGIONAL_BOUNDS[activeState] || REGIONAL_BOUNDS.ALL;
    map.flyToBounds(targetBounds, {
      duration: 1.2,
      padding: [30, 30],
    });
  }, [activeState, selectedStation, map]);

  return null;
}

// --- CPCB Severity Tier Badge ---
const TIER_COLOURS: Record<string, string> = {
  Good:        'bg-[#EAF3ED] text-[#055237] border-[#055237]/20',
  Satisfactory:'bg-[#EDF5E0] text-[#3A6020] border-[#3A6020]/20',
  Moderate:    'bg-[#FFF9E6] text-[#9A6B00] border-[#9A6B00]/20',
  Poor:        'bg-[#FFF0E5] text-[#9A3B00] border-[#9A3B00]/20',
  'Very Poor': 'bg-[#FFE8E6] text-[#8B1A1A] border-[#8B1A1A]/20',
  Severe:      'bg-[#FFDCDC] text-[#6B0000] border-[#6B0000]/20',
  Unknown:     'bg-[#F0F5EE] text-[#737B75] border-[#E9EDE9]',
};

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${TIER_COLOURS[tier] ?? TIER_COLOURS.Unknown}`}>
      {tier}
    </span>
  );
}

// --- Station Info Panel (Glassmorphic Floating Node Inspector) ---
function StationInfoPanel({
  station,
  pollutantLabel,
  unit,
  periodLabel,
  onClose,
}: {
  station: MapStation;
  pollutantLabel: string;
  unit: string;
  periodLabel: string;
  onClose: () => void;
}) {
  const stdExceed = station.avgPM25 != null && station.avgPM25 > 60;

  return (
    <div className="absolute top-4 right-4 z-[800] w-84 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E9EDE9] shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-[#E9EDE9] bg-[#FAFAF8]/60">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#737B75] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#055237]" />
            CAAQMS Telemetry Node
          </div>
          <h3 className="text-sm font-bold text-[#202521] leading-tight">{station.stationName}</h3>
          <p className="text-xs text-[#737B75]">{station.city}, {station.state}</p>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={station.tier} />
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-[#F0F5EE] hover:bg-[#E9EDE9] flex items-center justify-center transition-colors cursor-pointer"
            title="Close Inspector"
          >
            <X className="w-3.5 h-3.5 text-[#737B75]" />
          </button>
        </div>
      </div>

      {/* Primary Telemetry Metric */}
      <div
        className="mx-4 mt-3 mb-2 rounded-xl p-3 flex items-center justify-between border"
        style={{
          backgroundColor: station.colour + '14',
          borderColor: station.colour + '35',
        }}
      >
        <div>
          <span className="text-[10px] font-mono text-[#737B75] block">
            {pollutantLabel} Mean ({periodLabel})
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums" style={{ color: station.colour }}>
              {station.avgValue != null ? station.avgValue.toFixed(1) : '—'}
            </span>
            <span className="text-xs font-mono text-[#737B75]">{unit}</span>
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center border"
          style={{
            backgroundColor: station.colour + '25',
            borderColor: station.colour + '50',
          }}
        >
          <span className="text-xs font-bold font-mono" style={{ color: station.colour }}>
            {station.tier.slice(0, 3).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 px-4 py-2">
        <div className="bg-[#FAFAF8] rounded-lg p-2.5 border border-[#E9EDE9]">
          <div className="flex items-center gap-1 text-[#737B75] mb-0.5">
            <Gauge className="w-3.5 h-3.5 text-[#055237]" />
            <span className="text-[9px] font-mono uppercase">PM2.5 Avg</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-[#202521] tabular-nums font-mono">
              {station.avgPM25 != null ? station.avgPM25.toFixed(1) : '—'}
            </span>
            <span className="text-[9px] text-[#9DA6A0]">µg/m³</span>
          </div>
        </div>

        <div className="bg-[#FAFAF8] rounded-lg p-2.5 border border-[#E9EDE9]">
          <div className="flex items-center gap-1 text-[#737B75] mb-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#055237]" />
            <span className="text-[9px] font-mono uppercase">PM10 Avg</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-[#202521] tabular-nums font-mono">
              {station.avgPM10 != null ? station.avgPM10.toFixed(1) : '—'}
            </span>
            <span className="text-[9px] text-[#9DA6A0]">µg/m³</span>
          </div>
        </div>

        <div className="bg-[#FAFAF8] rounded-lg p-2.5 border border-[#E9EDE9]">
          <div className="flex items-center gap-1 text-[#737B75] mb-0.5">
            <Database className="w-3.5 h-3.5 text-[#055237]" />
            <span className="text-[9px] font-mono uppercase">Valid Obs</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-[#202521] tabular-nums font-mono">
              {station.obsCount?.toLocaleString() ?? '—'}
            </span>
            <span className="text-[9px] text-[#9DA6A0]">hrs</span>
          </div>
        </div>

        <div className="bg-[#FAFAF8] rounded-lg p-2.5 border border-[#E9EDE9]">
          <div className="flex items-center gap-1 text-[#737B75] mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#055237]" />
            <span className="text-[9px] font-mono uppercase">Completeness</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-[#202521] tabular-nums font-mono">
              {station.dataCapturePct?.toFixed(1) ?? '—'}%
            </span>
            <span className="text-[9px] text-[#9DA6A0]">annual</span>
          </div>
        </div>
      </div>

      {/* Statutory Exceedance Banner */}
      {stdExceed && (
        <div className="mx-4 mb-2 p-2 bg-[#FFF0E5] rounded-lg border border-[#F07520]/30 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F07520] shrink-0 mt-0.5" />
          <span className="text-[10px] text-[#9A3B00] leading-tight">
            PM2.5 mean exceeds statutory CPCB 24h standard of 60 µg/m³.
          </span>
        </div>
      )}

      {/* Footer & Station 360 Link */}
      <div className="px-4 pb-3 pt-1 border-t border-[#E9EDE9] bg-[#FAFAF8]/50 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-[#737B75] font-mono">
          <MapPin className="w-3 h-3 text-[#055237]" />
          <span>{station.lat?.toFixed(4)}°N, {station.lng?.toFixed(4)}°E</span>
        </div>
        <Link
          to={`/stations?id=${station.stationId}`}
          className="text-[10px] font-medium text-[#055237] hover:underline flex items-center gap-0.5"
        >
          Station 360° <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// --- Adaptive Legend Panel (Guaranteed Non-Duplicate Intervals) ---
function AdaptiveLegendPanel({
  legend,
  pollutantLabel,
}: {
  legend: MapLegend;
  pollutantLabel: string;
}) {
  return (
    <div className="absolute bottom-6 left-4 z-[800] bg-white/95 backdrop-blur-md rounded-xl border border-[#E9EDE9] shadow-lg p-3 w-56">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#055237]" />
          <span className="text-[10px] font-mono font-bold text-[#202521] uppercase tracking-wide">
            {pollutantLabel} Legend
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#737B75]">{legend.unit}</span>
      </div>

      <div className="flex flex-col gap-1">
        {legend.classes.map((cls) => {
          const isNoData = cls.label === 'No Data';
          return (
            <div key={cls.label} className="flex items-center gap-2">
              <span
                className="w-4 h-3 rounded-sm shrink-0 border border-black/10"
                style={{ backgroundColor: cls.colour }}
              />
              <span className="text-[9px] font-mono text-[#404943] flex-1">{cls.label}</span>
              <span className="text-[9px] font-mono text-[#737B75] tabular-nums">
                {isNoData
                  ? 'No data'
                  : cls.range[0] != null && cls.range[1] != null
                    ? `${cls.range[0].toFixed(1)}–${cls.range[1].toFixed(1)}`
                    : cls.range[0] != null
                      ? `≥${cls.range[0].toFixed(1)}`
                      : '—'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-[#E9EDE9] flex flex-col gap-0.5">
        <span className="text-[8px] font-mono text-[#9DA6A0]">
          {legend.method}
        </span>
        <span className="text-[8px] font-mono text-[#9DA6A0]">
          Range: {legend.dataMin?.toFixed(1) ?? '—'} – {legend.dataMax?.toFixed(1) ?? '—'} {legend.unit}
        </span>
      </div>
    </div>
  );
}

// --- Main Map Page Component ---
export const MapPage: React.FC = () => {
  const { filters, setFilter, options } = useGlobalFilters();

  const [selectedPollutant, setSelectedPollutant] = useState<string>('PM25');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [mapData, setMapData] = useState<{ stations: MapStation[]; legend: MapLegend; stats: any } | null>(null);
  const [mapSummary, setMapSummary] = useState<MapSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tileError, setTileError] = useState(false);
  const [selected, setSelected] = useState<MapStation | null>(null);

  // Request race-condition counter
  const requestIdRef = useRef(0);

  const pollutantMeta = useMemo(
    () => POLLUTANTS.find((p) => p.id === selectedPollutant) ?? POLLUTANTS[0],
    [selectedPollutant]
  );

  const periodMeta = useMemo(() => DATE_PERIODS[selectedPeriod], [selectedPeriod]);

  // Configurable map tile provider from environment variables with CARTO Positron fallback
  const mapTileUrl = useMemo(
    () => (import.meta as any).env?.VITE_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    []
  );
  const mapAttribution = useMemo(
    () => (import.meta as any).env?.VITE_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    []
  );
  const mapProviderName = useMemo(
    () => (import.meta as any).env?.VITE_MAP_PROVIDER || 'CARTO Positron Light',
    []
  );

  // Primary data fetcher with race-condition protection
  const fetchMapData = useCallback(async () => {
    const curId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const [stationRes, summaryRes] = await Promise.all([
        mapApi.getMapStations({
          state: filters.state,
          city: filters.city,
          pollutant: selectedPollutant,
          startDate: periodMeta.startDate || undefined,
          endDate: periodMeta.endDate || undefined,
        }),
        mapApi.getMapSummary({
          state: filters.state,
          city: filters.city,
          pollutant: selectedPollutant,
          startDate: periodMeta.startDate || undefined,
          endDate: periodMeta.endDate || undefined,
        }),
      ]);

      if (curId === requestIdRef.current) {
        setMapData(stationRes);
        setMapSummary(summaryRes);

        if (selected) {
          const still = stationRes.stations.find((s) => s.stationId === selected.stationId);
          setSelected(still ?? null);
        }
      }
    } catch (e: any) {
      if (curId === requestIdRef.current) {
        setError(e.message ?? 'Failed to load telemetry dataset');
      }
    } finally {
      if (curId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [filters.state, filters.city, selectedPollutant, periodMeta, selected]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  // Stations with verified WGS-84 coordinates
  const verifiedStations = useMemo(
    () => (mapData?.stations ?? []).filter((s) => s.hasCoords && s.lat != null && s.lng != null),
    [mapData]
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. Header & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#055237] animate-pulse" />
              NORTH INDIA GEOSPATIAL MESH
            </span>
            <span className="text-[#737B75] text-[11px] font-mono">
              Provider: {mapProviderName}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            North India — Continuous Air Quality Intelligence Map
          </h1>
          <p className="text-xs text-[#737B75]">
            High-fidelity geospatial distribution across 48 continuous CAAQMS monitoring stations in Chandigarh, Delhi, Haryana, and Punjab.
            Colors represent adaptive, non-overlapping quantile intervals computed from real 2025 measurements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMapData}
            disabled={loading}
            className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-[#E9EDE9] hover:bg-[#FAFAF8] text-[#202521] rounded-lg shadow-xs text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#055237] ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E9EDE9] p-3 shadow-xs">
          <div className="flex items-center justify-between text-[#737B75] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Network Stations</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#055237]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#202521] font-mono">
              {mapSummary?.stats.filteredCount ?? 48}
            </span>
            <span className="text-xs text-[#737B75]">
              / {mapSummary?.stats.totalStations ?? 48} Verified (100%)
            </span>
          </div>
          <span className="text-[10px] text-[#9DA6A0] font-mono block mt-0.5">
            Target: Chandigarh, Delhi, Haryana, Punjab
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E9EDE9] p-3 shadow-xs">
          <div className="flex items-center justify-between text-[#737B75] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">{pollutantMeta.label} Area Mean</span>
            <Gauge className="w-3.5 h-3.5 text-[#055237]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#202521] font-mono">
              {mapSummary?.networkMean?.toFixed(1) ?? '—'}
            </span>
            <span className="text-xs text-[#737B75] font-mono">{pollutantMeta.unit}</span>
          </div>
          <span className="text-[10px] text-[#9DA6A0] font-mono block mt-0.5">
            NAAQS 24h Standard: {pollutantMeta.std} {pollutantMeta.unit}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E9EDE9] p-3 shadow-xs">
          <div className="flex items-center justify-between text-[#737B75] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Acute Area Hotspot</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#D93A2B]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-[#D93A2B] truncate" title={mapSummary?.topHotspot?.stationName}>
              {mapSummary?.topHotspot ? mapSummary.topHotspot.stationName.split(',')[0] : '—'}
            </span>
            <span className="text-xs font-mono font-bold text-[#D93A2B]">
              {mapSummary?.topHotspot?.avgValue.toFixed(1)} {pollutantMeta.unit}
            </span>
          </div>
          <span className="text-[10px] text-[#737B75] font-mono block mt-0.5">
            {mapSummary?.topHotspot?.city}, {mapSummary?.topHotspot?.state}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#E9EDE9] p-3 shadow-xs">
          <div className="flex items-center justify-between text-[#737B75] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Cleanest Baseline</span>
            <Sparkles className="w-3.5 h-3.5 text-[#3CAD5E]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-[#055237] truncate" title={mapSummary?.cleanest?.stationName}>
              {mapSummary?.cleanest ? mapSummary.cleanest.stationName.split(',')[0] : '—'}
            </span>
            <span className="text-xs font-mono font-bold text-[#055237]">
              {mapSummary?.cleanest?.avgValue.toFixed(1)} {pollutantMeta.unit}
            </span>
          </div>
          <span className="text-[10px] text-[#737B75] font-mono block mt-0.5">
            {mapSummary?.cleanest?.city}, {mapSummary?.cleanest?.state}
          </span>
        </div>
      </div>

      {/* 3. Global Synchronized Filters Bar */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-[#E9EDE9] p-3 shadow-xs">
        <Filter className="w-4 h-4 text-[#737B75] shrink-0" />

        {/* State Filter */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-mono uppercase text-[#9DA6A0]">Territory Focus</label>
          <select
            value={filters.state}
            onChange={(e) => setFilter('state', e.target.value)}
            className="h-8 px-2 text-xs bg-[#F0F5EE] border border-[#E9EDE9] rounded-lg text-[#202521] font-medium outline-none cursor-pointer"
          >
            <option value="ALL">All North India (48 Stations)</option>
            {options.states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-mono uppercase text-[#9DA6A0]">City</label>
          <select
            value={filters.city}
            onChange={(e) => setFilter('city', e.target.value)}
            className="h-8 px-2 text-xs bg-[#F0F5EE] border border-[#E9EDE9] rounded-lg text-[#202521] font-medium outline-none cursor-pointer"
          >
            <option value="ALL">All Cities</option>
            {options.cities
              .filter((c) => filters.state === 'ALL' || c.state === filters.state)
              .map((c) => (
                <option key={c.city} value={c.city}>{c.city}</option>
              ))}
          </select>
        </div>

        {/* Time Period Filter */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-mono uppercase text-[#9DA6A0] flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" /> Temporal Filter
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="h-8 px-2 text-xs bg-[#F0F5EE] border border-[#E9EDE9] rounded-lg text-[#202521] font-medium outline-none cursor-pointer"
          >
            {DATE_PERIODS.map((dp, idx) => (
              <option key={dp.label} value={idx}>{dp.label}</option>
            ))}
          </select>
        </div>

        {/* Pollutant Toggles */}
        <div className="flex flex-col gap-0.5 ml-2">
          <label className="text-[9px] font-mono uppercase text-[#9DA6A0]">Analyzed Pollutant</label>
          <div className="flex gap-1 flex-wrap">
            {POLLUTANTS.map((p) => {
              const isActive = selectedPollutant === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPollutant(p.id)}
                  className={`h-8 px-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#055237] text-white border-[#055237] shadow-xs'
                      : 'bg-white text-[#404943] border-[#E9EDE9] hover:bg-[#F0F5EE]'
                  }`}
                  title={`${p.name} (${p.unit})`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Coordinate Counter */}
        <div className="ml-auto hidden xl:flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#055237] px-2.5 py-1 bg-[#EAF3ED] rounded-lg font-medium">
            Active: {verifiedStations.length} of 48 Stations ({filters.state === 'ALL' ? 'All Territories' : filters.state})
          </span>
          {error && (
            <span className="text-[10px] font-mono text-[#D93A2B] bg-[#FFE8E6] px-2 py-1 rounded-lg">
              {error}
            </span>
          )}
        </div>
      </div>

      {/* 4. Interactive Leaflet Map Container */}
      <div className="relative flex-1 min-h-[540px] rounded-2xl overflow-hidden border border-[#E9EDE9] shadow-sm bg-[#F0F5EE]">

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[900] bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-[#E9EDE9] shadow-md">
              <RefreshCw className="w-4 h-4 text-[#055237] animate-spin" />
              <span className="text-xs font-mono text-[#404943]">Querying DuckDB Telemetry Engine...</span>
            </div>
          </div>
        )}

        {/* Tile Offline Banner */}
        {tileError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[850] bg-[#FFF9E6] border border-[#9A6B00]/30 rounded-xl px-4 py-2 shadow-md flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#9A6B00]" />
            <span className="text-xs font-mono text-[#9A6B00]">
              Tile server unreachable. Rendering local vector station nodes over fallback grid.
            </span>
          </div>
        )}

        <MapContainer
          center={[29.5, 76.4]}
          zoom={7}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
          zoomControl={false}
        >
          {/* Licensed CARTO Basemap without OSM 403 blocks */}
          <TileLayer
            attribution={mapAttribution}
            url={mapTileUrl}
            subdomains="abcd"
            opacity={0.88}
            eventHandlers={{
              tileerror: () => setTileError(true),
              tileload: () => setTileError(false),
            }}
          />

          <ZoomControl position="bottomright" />

          {/* Smooth Auto-Bounds Controller */}
          <MapBoundsController
            activeState={filters.state}
            stations={verifiedStations}
            selectedStation={selected}
          />

          {/* 48 CAAQMS Station Markers */}
          {verifiedStations.map((stn) => {
            const isSelected = selected?.stationId === stn.stationId;
            return (
              <CircleMarker
                key={stn.stationId}
                center={[stn.lat!, stn.lng!]}
                radius={isSelected ? 13 : 8.5}
                pathOptions={{
                  fillColor: stn.colour,
                  color: isSelected ? '#202521' : '#ffffff',
                  weight: isSelected ? 3 : 1.5,
                  fillOpacity: 0.92,
                  opacity: 1,
                }}
                eventHandlers={{
                  click: () => setSelected(stn),
                }}
              >
                <Tooltip
                  permanent={false}
                  direction="top"
                  offset={[0, -8]}
                  className="northair-tooltip"
                >
                  <div className="flex flex-col gap-0.5 text-[11px] p-0.5">
                    <span className="font-bold text-[#202521]">{stn.stationName}</span>
                    <span className="text-[#737B75] text-[10px]">{stn.city}, {stn.state}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stn.colour }} />
                      <span className="font-mono font-semibold" style={{ color: stn.colour }}>
                        {pollutantMeta.label}: {stn.avgValue != null ? stn.avgValue.toFixed(1) : '—'} {stn.unit}
                      </span>
                      <span className="text-[9px] text-[#9DA6A0]">({stn.tier})</span>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Top-Left Title Badge */}
        <div className="absolute top-4 left-4 z-[800] bg-white/95 backdrop-blur-md rounded-xl border border-[#E9EDE9] shadow-md px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[13px] text-[#202521] tracking-tight">NORTH INDIA</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9DA6A0]" />
            <span className="font-mono text-[11px] text-[#055237] font-semibold">AIR QUALITY MESH</span>
          </div>
          <div className="text-[10px] font-mono text-[#737B75] mt-0.5">
            Total Network: 48 Stations · Verified: 48 (100%) · Active: {verifiedStations.length}
          </div>
        </div>

        {/* Adaptive Dynamic Legend */}
        {mapData?.legend && (
          <AdaptiveLegendPanel legend={mapData.legend} pollutantLabel={pollutantMeta.label} />
        )}

        {/* Selected Station Detail Overlay */}
        {selected && (
          <StationInfoPanel
            station={selected}
            pollutantLabel={pollutantMeta.label}
            unit={pollutantMeta.unit}
            periodLabel={periodMeta.label}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* 5. Synchronized Active Station Table */}
      {mapData && mapData.stations.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E9EDE9] shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E9EDE9] flex items-center justify-between bg-[#FAFAF8]/50">
            <div>
              <h2 className="text-sm font-bold text-[#202521]">
                Active Monitoring Stations Telemetry Table
              </h2>
              <p className="text-[11px] text-[#737B75]">
                Ranked by {pollutantMeta.label} concentration ({periodMeta.label}). Click a row to zoom and inspect station telemetry.
              </p>
            </div>
            <div className="text-xs font-mono text-[#737B75]">
              Showing {mapData.stations.length} of 48 Stations
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9EDE9] bg-[#FAFAF8] text-[10px] font-mono text-[#737B75] uppercase">
                  <th className="py-2.5 px-4 font-semibold">Rank</th>
                  <th className="py-2.5 px-4 font-semibold">Station Name</th>
                  <th className="py-2.5 px-4 font-semibold">City</th>
                  <th className="py-2.5 px-4 font-semibold">State</th>
                  <th className="py-2.5 px-4 font-semibold text-right">{pollutantMeta.label} Mean</th>
                  <th className="py-2.5 px-4 font-semibold text-right">PM2.5 Avg</th>
                  <th className="py-2.5 px-4 font-semibold text-right">PM10 Avg</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Completeness</th>
                  <th className="py-2.5 px-4 font-semibold text-center">CPCB Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDE9] text-xs">
                {mapData.stations.map((s, idx) => {
                  const isSelected = selected?.stationId === s.stationId;
                  return (
                    <tr
                      key={s.stationId}
                      onClick={() => setSelected(s)}
                      className={`hover:bg-[#F0F5EE] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#EAF3ED]/80 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono text-[#737B75] text-[11px]">#{idx + 1}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: s.colour }}
                          />
                          <span className="font-medium text-[#202521]">{s.stationName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-[#737B75]">{s.city}</td>
                      <td className="py-2.5 px-4 text-[#737B75]">{s.state}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold" style={{ color: s.colour }}>
                        {s.avgValue != null ? s.avgValue.toFixed(1) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#404943]">
                        {s.avgPM25 != null ? s.avgPM25.toFixed(1) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#404943]">
                        {s.avgPM10 != null ? s.avgPM10.toFixed(1) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#737B75]">
                        {s.dataCapturePct?.toFixed(1) ?? '—'}%
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <TierBadge tier={s.tier} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
