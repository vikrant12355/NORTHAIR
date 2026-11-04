import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mapApi, MapStation, MapLegend } from '../../api/map.api';
import { useGlobalFilters } from '../../context/FilterContext';
import {
  Layers, RefreshCw, MapPin, Info, ChevronRight,
  TrendingUp, Gauge, Database, AlertTriangle, CheckCircle2, X
} from 'lucide-react';

// ─── Leaflet fix for missing default marker icons in Vite ───────────────────
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Pollutant options ───────────────────────────────────────────────────────
const POLLUTANTS = [
  { id: 'PM25',  label: 'PM2.5', unit: 'µg/m³', std: 60   },
  { id: 'PM10',  label: 'PM10',  unit: 'µg/m³', std: 100  },
  { id: 'NO2',   label: 'NO₂',   unit: 'µg/m³', std: 80   },
  { id: 'SO2',   label: 'SO₂',   unit: 'µg/m³', std: 80   },
  { id: 'CO',    label: 'CO',    unit: 'mg/m³',  std: 2    },
  { id: 'OZONE', label: 'Ozone', unit: 'µg/m³', std: 100  },
  { id: 'NH3',   label: 'NH₃',   unit: 'µg/m³', std: 400  },
];

// ─── Map bounds auto-fit component ──────────────────────────────────────────
function MapBoundsController({ stations }: { stations: MapStation[] }) {
  const map = useMap();
  useEffect(() => {
    const coords = stations.filter((s) => s.hasCoords && s.lat && s.lng);
    if (!coords.length) {
      map.setView([29.5, 76.4], 7);
      return;
    }
    const lats = coords.map((s) => s.lat as number);
    const lngs = coords.map((s) => s.lng as number);
    map.fitBounds(
      [
        [Math.min(...lats) - 0.3, Math.min(...lngs) - 0.3],
        [Math.max(...lats) + 0.3, Math.max(...lngs) + 0.3],
      ],
      { padding: [30, 30] }
    );
  }, [stations, map]);
  return null;
}

// ─── Tier badge ─────────────────────────────────────────────────────────────
const TIER_COLOURS: Record<string, string> = {
  Good:       'bg-[#EAF3ED] text-[#055237]',
  Satisfactory:'bg-[#EDF5E0] text-[#3A6020]',
  Moderate:   'bg-[#FFF9E6] text-[#9A6B00]',
  Poor:       'bg-[#FFF0E5] text-[#9A3B00]',
  'Very Poor':'bg-[#FFE8E6] text-[#8B1A1A]',
  Severe:     'bg-[#FFDCDC] text-[#6B0000]',
  Unknown:    'bg-[#F0F5EE] text-[#737B75]',
};

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${TIER_COLOURS[tier] ?? TIER_COLOURS.Unknown}`}>
      {tier}
    </span>
  );
}

// ─── Station Info Panel ──────────────────────────────────────────────────────
function StationInfoPanel({
  station,
  pollutantLabel,
  unit,
  onClose,
}: {
  station: MapStation;
  pollutantLabel: string;
  unit: string;
  onClose: () => void;
}) {
  const stdExceed = station.avgPM25 != null && station.avgPM25 > 60;

  return (
    <div className="absolute top-4 right-4 z-[800] w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E9EDE9] shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[9px] text-[#737B75] uppercase tracking-widest">Station Node Inspector</span>
          <h3 className="text-sm font-bold text-[#202521] leading-tight">{station.stationName}</h3>
          <p className="text-xs text-[#737B75]">{station.city}, {station.state}</p>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={station.tier} />
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-[#F0F5EE] hover:bg-[#E9EDE9] flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#737B75]" />
          </button>
        </div>
      </div>

      {/* Key Metric */}
      <div
        className="mx-4 mt-4 mb-2 rounded-xl p-3 flex items-center justify-between"
        style={{ backgroundColor: station.colour + '18', borderColor: station.colour + '30', borderWidth: 1 }}
      >
        <div>
          <span className="text-[10px] font-mono text-[#737B75] block">{pollutantLabel} Annual Mean</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums" style={{ color: station.colour }}>
              {station.avgValue != null ? station.avgValue.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-[#737B75]">{unit}</span>
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: station.colour + '25' }}
        >
          <span className="text-sm" style={{ color: station.colour }}>●</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 px-4 py-2">
        {[
          { label: 'PM2.5 Avg', value: station.avgPM25?.toFixed(1), unit: 'µg/m³', icon: <Gauge className="w-3.5 h-3.5" /> },
          { label: 'PM10 Avg',  value: station.avgPM10?.toFixed(1),  unit: 'µg/m³', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { label: 'Obs. Count',value: station.obsCount?.toLocaleString(), unit: 'hrs', icon: <Database className="w-3.5 h-3.5" /> },
          { label: 'Completeness', value: station.dataCapturePct?.toFixed(1), unit: '%', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        ].map(({ label, value, unit: u, icon }) => (
          <div key={label} className="bg-[#FAFAF8] rounded-lg p-2.5 border border-[#E9EDE9]">
            <div className="flex items-center gap-1 text-[#737B75] mb-0.5">
              {icon}
              <span className="text-[9px] font-mono uppercase">{label}</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-[#202521] tabular-nums">{value ?? '—'}</span>
              <span className="text-[9px] text-[#9DA6A0]">{u}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Exceedance alert */}
      {stdExceed && (
        <div className="mx-4 mb-3 mt-1 p-2.5 bg-[#FFF0E5] rounded-lg border border-[#F07520]/30 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F07520] shrink-0 mt-0.5" />
          <span className="text-[10px] text-[#9A3B00]">
            PM2.5 annual mean exceeds NAAQS 24h standard of 60 µg/m³ (CPCB).
          </span>
        </div>
      )}

      {/* Coordinates */}
      {station.lat && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5 text-[10px] text-[#737B75] font-mono">
            <MapPin className="w-3 h-3" />
            {station.lat.toFixed(4)}°N, {station.lng?.toFixed(4)}°E
            <span className="ml-auto text-[#9DA6A0]">WGS-84</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Legend Panel ────────────────────────────────────────────────────────────
function LegendPanel({ legend, pollutantLabel }: { legend: MapLegend; pollutantLabel: string }) {
  return (
    <div className="absolute bottom-6 left-4 z-[800] bg-white/95 backdrop-blur-md rounded-xl border border-[#E9EDE9] shadow-lg p-3 w-52">
      <div className="flex items-center gap-1.5 mb-2">
        <Layers className="w-3.5 h-3.5 text-[#055237]" />
        <span className="text-[10px] font-mono font-bold text-[#202521] uppercase tracking-wide">
          {pollutantLabel} Concentration
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {legend.classes.map((cls) => (
          <div key={cls.label} className="flex items-center gap-2">
            <span
              className="w-4 h-3 rounded-sm shrink-0 border border-white/50"
              style={{ backgroundColor: cls.colour }}
            />
            <span className="text-[9px] font-mono text-[#404943] flex-1">{cls.label}</span>
            {cls.range[0] != null && (
              <span className="text-[9px] font-mono text-[#737B75] tabular-nums">
                {cls.range[0].toFixed(1)}{cls.range[1] != null ? `–${cls.range[1].toFixed(1)}` : '+'}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-[#E9EDE9]">
        <span className="text-[8px] font-mono text-[#9DA6A0] block">
          Method: Quantile (6-class)
        </span>
        <span className="text-[8px] font-mono text-[#9DA6A0]">
          Unit: {legend.unit} · Period: 2025 Annual
        </span>
      </div>
    </div>
  );
}

// ─── Main Map Page ───────────────────────────────────────────────────────────
export const MapPage: React.FC = () => {
  const { filters, setFilter, options } = useGlobalFilters();

  const [selectedPollutant, setSelectedPollutant] = useState('PM25');
  const [mapData, setMapData]   = useState<{ stations: MapStation[]; legend: MapLegend } | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [selected, setSelected] = useState<MapStation | null>(null);

  const pollutantMeta = useMemo(
    () => POLLUTANTS.find((p) => p.id === selectedPollutant) ?? POLLUTANTS[0],
    [selectedPollutant]
  );

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mapApi.getMapStations({
        state: filters.state,
        city: filters.city,
        pollutant: selectedPollutant,
      });
      setMapData(data);
      // Reset selection if station no longer in result
      if (selected) {
        const still = data.stations.find((s) => s.stationId === selected.stationId);
        if (!still) setSelected(null);
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  }, [filters.state, filters.city, selectedPollutant]);

  useEffect(() => { fetchMapData(); }, [fetchMapData]);

  const stationsWithCoords = useMemo(
    () => (mapData?.stations ?? []).filter((s) => s.hasCoords && s.lat != null && s.lng != null),
    [mapData]
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#055237] animate-pulse" />
              GIS INTELLIGENCE
            </span>
            <span className="text-[#737B75] text-[11px] font-mono">48 CAAQMS NODES · 2025</span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            North India — Air Quality Intelligence Map
          </h1>
          <p className="text-xs text-[#737B75]">
            Explore monitoring locations and regional pollution patterns across North India.
            Colours represent data-driven quantile classification of real 2025 measurements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMapData}
            disabled={loading}
            className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-[#E9EDE9] hover:bg-[#FAFAF8] text-[#202521] rounded-lg shadow-xs text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#055237] ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-[#E9EDE9] p-3 shadow-xs">
        <Info className="w-4 h-4 text-[#737B75] shrink-0" />
        <span className="text-xs text-[#737B75] font-mono mr-2">Filters:</span>

        {/* State */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-mono uppercase text-[#9DA6A0]">State</label>
          <select
            value={filters.state}
            onChange={(e) => setFilter('state', e.target.value)}
            className="h-8 px-2 text-xs bg-[#F0F5EE] border border-[#E9EDE9] rounded-lg text-[#202521] font-medium outline-none cursor-pointer"
          >
            <option value="ALL">All States</option>
            {options.states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* City */}
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
              .map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
          </select>
        </div>

        {/* Pollutant */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[9px] font-mono uppercase text-[#9DA6A0]">Pollutant</label>
          <div className="flex gap-1 flex-wrap">
            {POLLUTANTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPollutant(p.id)}
                className={`h-8 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  selectedPollutant === p.id
                    ? 'bg-[#055237] text-white border-[#055237] shadow-sm'
                    : 'bg-white text-[#404943] border-[#E9EDE9] hover:bg-[#F0F5EE]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary badges */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#737B75]">
            {stationsWithCoords.length} stations mapped
          </span>
          {error && (
            <span className="text-[10px] font-mono text-[#D93A2B]">⚠ {error}</span>
          )}
        </div>
      </div>

      {/* ── Map container ── */}
      <div className="relative flex-1 min-h-[520px] rounded-2xl overflow-hidden border border-[#E9EDE9] shadow-sm bg-[#F0F5EE]">

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-[900] bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-[#E9EDE9] shadow-md">
              <RefreshCw className="w-4 h-4 text-[#055237] animate-spin" />
              <span className="text-xs font-mono text-[#404943]">Loading telemetry…</span>
            </div>
          </div>
        )}

        <MapContainer
          center={[29.5, 76.4]}
          zoom={7}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            opacity={0.75}
          />
          <ZoomControl position="bottomright" />
          {mapData && <MapBoundsController stations={stationsWithCoords} />}

          {stationsWithCoords.map((stn) => {
            const isSelected = selected?.stationId === stn.stationId;
            return (
              <CircleMarker
                key={stn.stationId}
                center={[stn.lat!, stn.lng!]}
                radius={isSelected ? 12 : 8}
                pathOptions={{
                  fillColor: stn.colour,
                  color: isSelected ? '#202521' : '#fff',
                  weight: isSelected ? 2.5 : 1.5,
                  fillOpacity: 0.88,
                  opacity: 1,
                }}
                eventHandlers={{ click: () => setSelected(stn) }}
              >
                <Tooltip
                  permanent={false}
                  direction="top"
                  offset={[0, -6]}
                  className="northair-tooltip"
                >
                  <div className="flex flex-col gap-0.5 text-[11px]">
                    <span className="font-bold text-[#202521]">{stn.stationName}</span>
                    <span className="text-[#737B75]">{stn.city}, {stn.state}</span>
                    <span className="font-mono font-semibold" style={{ color: stn.colour }}>
                      {pollutantMeta.label}: {stn.avgValue != null ? stn.avgValue.toFixed(1) : '—'} {stn.unit}
                    </span>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Map title overlay */}
        <div className="absolute top-4 left-4 z-[800] bg-white/90 backdrop-blur-md rounded-xl border border-[#E9EDE9] shadow-md px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[13px] text-[#202521] tracking-tight">NORTH INDIA</span>
            <ChevronRight className="w-3 h-3 text-[#9DA6A0]" />
            <span className="font-mono text-[10px] text-[#737B75]">AIR QUALITY INTELLIGENCE MAP</span>
          </div>
          <div className="text-[9px] font-mono text-[#9DA6A0] mt-0.5">
            {stationsWithCoords.length} of 48 stations with verified WGS-84 coordinates
          </div>
        </div>

        {/* Legend */}
        {mapData?.legend && (
          <LegendPanel legend={mapData.legend} pollutantLabel={pollutantMeta.label} />
        )}

        {/* Station Info Panel */}
        {selected && (
          <StationInfoPanel
            station={selected}
            pollutantLabel={pollutantMeta.label}
            unit={pollutantMeta.unit}
            onClose={() => setSelected(null)}
          />
        )}

        {/* Attribution row */}
        <div className="absolute bottom-6 right-14 z-[800] hidden lg:flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-[#E9EDE9] text-[9px] font-mono text-[#9DA6A0]">
          <span>CPCB / SPCB Telemetry 2025</span>
          <span>·</span>
          <span>OSM Basemap</span>
          <span>·</span>
          <span>WGS-84</span>
        </div>
      </div>

      {/* ── Summary table ── */}
      {mapData && mapData.stations.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E9EDE9] shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E9EDE9] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#202521]">Station Telemetry Summary</span>
            <span className="text-[10px] font-mono text-[#737B75]">
              Sorted by {pollutantMeta.label} mean (descending)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E9EDE9] bg-[#FAFAF8]">
                  {['Station', 'City', 'State', pollutantMeta.label + ' Mean', 'PM2.5 Mean', 'Completeness', 'Tier'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-mono text-[10px] text-[#737B75] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mapData.stations.slice(0, 15).map((s) => (
                  <tr
                    key={s.stationId}
                    onClick={() => setSelected(s)}
                    className={`border-b border-[#E9EDE9] transition-colors cursor-pointer ${
                      selected?.stationId === s.stationId ? 'bg-[#EAF3ED]' : 'hover:bg-[#F0F5EE]'
                    }`}
                  >
                    <td className="px-4 py-2.5 font-medium text-[#202521] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.colour }} />
                        {s.stationName.length > 32 ? s.stationName.substring(0, 32) + '…' : s.stationName}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[#404943]">{s.city}</td>
                    <td className="px-4 py-2.5 text-[#404943]">{s.state}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold tabular-nums" style={{ color: s.colour }}>
                      {s.avgValue != null ? s.avgValue.toFixed(1) : '—'} <span className="text-[9px] font-normal text-[#9DA6A0]">{s.unit}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-[#404943]">
                      {s.avgPM25 != null ? s.avgPM25.toFixed(1) : '—'} <span className="text-[9px] text-[#9DA6A0]">µg/m³</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-[#404943]">
                      {s.dataCapturePct?.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5">
                      <TierBadge tier={s.tier} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mapData.stations.length > 15 && (
              <div className="px-4 py-2 text-[10px] font-mono text-[#737B75] border-t border-[#E9EDE9] bg-[#FAFAF8]">
                Showing top 15 of {mapData.stations.length} stations · Select a state filter to narrow results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

