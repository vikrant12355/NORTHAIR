import React, { useState } from 'react';
import { StationItem } from '../../types';
import { SeverityChip } from '../cards/SeverityChip';
import { MapPin, Wind, Droplets, Activity } from 'lucide-react';

interface SpatialMapProps {
  stations: StationItem[];
  onSelectStation?: (station: StationItem) => void;
}

export const SpatialMap: React.FC<SpatialMapProps> = ({ stations, onSelectStation }) => {
  const [selected, setSelected] = useState<StationItem | null>(stations[0] || null);

  // Geo bounds for North India sub-continental viewport:
  // Lat: 27.5 to 32.2 (Height: 4.7 deg)
  // Lng: 74.0 to 78.0 (Width: 4.0 deg)
  const minLat = 27.5;
  const maxLat = 32.2;
  const minLng = 74.2;
  const maxLng = 78.0;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(8, Math.min(92, y)),
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Interactive Map Vector Canvas */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-[#E9EDE9] shadow-xs p-4 flex flex-col justify-between relative overflow-hidden">
        {/* Map Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9EDE9] z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#055237]">satellite_alt</span>
            <span className="text-sm font-semibold text-[#202521]">
              Northern Sub-Continental GIS Mesh
            </span>
            <span className="font-mono text-[10px] text-[#737B75] px-2 py-0.5 bg-[#F0F5EE] rounded-full">
              48 Monitored Nodes
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#737B75]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#26966B]"></span> Good
            <span className="inline-block w-2 h-2 rounded-full bg-[#E5B94F] ml-1"></span> Mod
            <span className="inline-block w-2 h-2 rounded-full bg-[#E58B38] ml-1"></span> Poor
            <span className="inline-block w-2 h-2 rounded-full bg-[#BA1A1A] ml-1"></span> Severe
          </div>
        </div>

        {/* Vector SVG Canvas */}
        <div className="relative w-full h-[460px] my-3 bg-[#F0F5EE] rounded-lg overflow-hidden flex items-center justify-center select-none border border-[#E9EDE9]">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full text-[#D6DCD7]/40">
            <defs>
              <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeDasharray="2 4" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gis-grid)" />
            {/* Atmospheric flow contour lines */}
            <path
              d="M 80,60 Q 220,130 360,110 T 600,200 T 780,340"
              fill="none"
              stroke="#26966B"
              strokeDasharray="4 2"
              strokeOpacity="0.4"
              strokeWidth="1.2"
            />
            <path
              d="M 100,160 Q 260,240 400,260 T 620,380 T 800,430"
              fill="none"
              stroke="#E58B38"
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />
          </svg>

          {/* Territory Labels */}
          <div className="absolute top-8 left-16 text-[11px] font-mono font-bold text-[#737B75]/60 tracking-wider pointer-events-none">
            PUNJAB REGION
          </div>
          <div className="absolute top-14 left-[58%] text-[11px] font-mono font-bold text-[#737B75]/60 tracking-wider pointer-events-none">
            CHANDIGARH UT
          </div>
          <div className="absolute top-[48%] left-[42%] text-[11px] font-mono font-bold text-[#737B75]/60 tracking-wider pointer-events-none">
            HARYANA BASIN
          </div>
          <div className="absolute bottom-16 right-[28%] text-[11px] font-mono font-bold text-[#BA1A1A]/60 tracking-wider pointer-events-none">
            DELHI NCR
          </div>

          {/* Station Markers */}
          {stations.map((stn) => {
            const lat = stn.lat || 29.5;
            const lng = stn.lng || 76.5;
            const pos = project(lat, lng);
            const isSelected = selected?.stationId === stn.stationId;

            let markerColor = 'bg-[#26966B]';
            if (stn.tier === 'Satisfactory') markerColor = 'bg-[#8EBB56]';
            if (stn.tier === 'Moderate') markerColor = 'bg-[#E5B94F]';
            if (stn.tier === 'Poor') markerColor = 'bg-[#E58B38]';
            if (stn.tier === 'Very Poor') markerColor = 'bg-[#D85D43]';
            if (stn.tier === 'Severe') markerColor = 'bg-[#BA1A1A]';

            return (
              <div
                key={stn.stationId}
                style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                onClick={() => {
                  setSelected(stn);
                  if (onSelectStation) onSelectStation(stn);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                <div className="relative flex items-center justify-center">
                  {isSelected && (
                    <span className="animate-ping absolute h-6 w-6 rounded-full bg-[#055237] opacity-60"></span>
                  )}
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${markerColor} border-2 border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold group-hover:scale-125 transition-transform`}
                  ></span>
                </div>

                {/* Micro hover label */}
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#202521] text-white px-2 py-0.5 rounded text-[10px] font-mono shadow-md z-30 pointer-events-none">
                  {stn.stationName}: {stn.avgPM25} µg/m³
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#737B75] font-mono pt-2 border-t border-[#E9EDE9]">
          <span>Coordinates: 27.5°N - 32.2°N • 74.2°E - 78.0°E</span>
          <span>Click any node to inspect station profile</span>
        </div>
      </div>

      {/* Station Detail Drawer / Pod (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-xl border border-[#E9EDE9] shadow-xs p-5 flex flex-col justify-between">
        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="pb-3 border-b border-[#E9EDE9]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#737B75] uppercase font-semibold">
                  Station Node Inspector
                </span>
                <SeverityChip category={selected.tier} />
              </div>
              <h3 className="text-base font-bold text-[#202521] mt-1">{selected.stationName}</h3>
              <p className="text-xs text-[#737B75]">
                {selected.city}, {selected.state}
              </p>
            </div>

            {/* Particulate Readings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F0F5EE] p-3 rounded-lg border border-[#E9EDE9]">
                <span className="text-[10px] font-mono text-[#737B75] uppercase font-semibold">
                  PM2.5 (24h Mean)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[#202521] tabular-nums">
                    {selected.avgPM25 || '—'}
                  </span>
                  <span className="text-[10px] text-[#737B75]">µg/m³</span>
                </div>
                <span className="text-[10px] text-[#737B75] font-mono">
                  {selected.avgPM25 > 60
                    ? `+${Math.round(((selected.avgPM25 - 60) / 60) * 100)}% over standard`
                    : 'Within limit'}
                </span>
              </div>

              <div className="bg-[#F0F5EE] p-3 rounded-lg border border-[#E9EDE9]">
                <span className="text-[10px] font-mono text-[#737B75] uppercase font-semibold">
                  PM10 (24h Mean)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[#202521] tabular-nums">
                    {selected.avgPM10 || '—'}
                  </span>
                  <span className="text-[10px] text-[#737B75]">µg/m³</span>
                </div>
                <span className="text-[10px] text-[#737B75] font-mono">NAAQS: 100 µg/m³</span>
              </div>
            </div>

            {/* Meteorological Context */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono text-[#737B75] uppercase font-semibold">
                Atmospheric Dynamics
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-[#FAFAF8] rounded-md border border-[#E9EDE9]">
                  <Wind className="w-4 h-4 text-[#055237]" />
                  <div>
                    <span className="text-[10px] text-[#737B75] block">Wind Velocity</span>
                    <span className="font-semibold text-[#202521]">2.4 m/s NNW</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-[#FAFAF8] rounded-md border border-[#E9EDE9]">
                  <Droplets className="w-4 h-4 text-[#055237]" />
                  <div>
                    <span className="text-[10px] text-[#737B75] block">Relative Humidity</span>
                    <span className="font-semibold text-[#202521]">64.2%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality & Statutory compliance */}
            <div className="p-3 bg-[#EAF3ED] rounded-lg border border-[#055237]/20 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#055237]">CAAQMS Audit Status</span>
                <span className="font-mono text-[11px] text-[#055237] font-bold">
                  {selected.dataCapturePct}% Capture
                </span>
              </div>
              <p className="text-[11px] text-[#404943]">
                Statutory completeness exceeds mandatory CPCB 85% rule. Calibrated to ISO 17025.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 text-[#737B75]">
            <MapPin className="w-8 h-8 text-[#9DA6A0] mb-2" />
            <p className="text-xs">Select any station node from the map to inspect telemetry</p>
          </div>
        )}

        <div className="pt-3 border-t border-[#E9EDE9] flex justify-between items-center text-xs">
          <span className="font-mono text-[10px] text-[#737B75]">CPCB / SPCB Continuous Feed</span>
          <span className="text-[#055237] font-semibold text-[11px]">Online</span>
        </div>
      </div>
    </div>
  );
};

