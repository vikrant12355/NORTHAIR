import React from 'react';
import { HeatmapStation } from '../../types';

interface HeatmapMatrixProps {
  data: HeatmapStation[];
  limit?: number;
}

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function getCellColor(val?: number) {
  if (val === undefined || val === null) return 'bg-[#E5E9E3] text-[#737B75]';
  if (val <= 30) return 'bg-[#26966B] text-white';
  if (val <= 60) return 'bg-[#8EBB56] text-white';
  if (val <= 90) return 'bg-[#E5B94F] text-[#202521] font-semibold';
  if (val <= 120) return 'bg-[#E58B38] text-white';
  if (val <= 250) return 'bg-[#BA1A1A] text-white font-semibold';
  return 'bg-[#5C0A0A] text-white font-bold shadow-xs';
}

export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({ data, limit = 15 }) => {
  const displayStations = data.slice(0, limit);

  return (
    <div className="overflow-x-auto w-full">
      <div className="min-w-[840px] flex flex-col gap-1.5">
        {/* Month Headers */}
        <div className="grid grid-cols-[240px_repeat(12,1fr)] gap-1 text-center font-mono text-[10px] text-[#737B75] pb-2 border-b border-[#E9EDE9]">
          <div className="text-left pl-2 font-bold uppercase">Station / Basin Cluster</div>
          {months.map((m) => (
            <div key={m} className="font-semibold">
              {m}
            </div>
          ))}
        </div>

        {/* Heatmap Rows */}
        {displayStations.map((stn) => (
          <div
            key={stn.stationName}
            className="grid grid-cols-[240px_repeat(12,1fr)] gap-1 items-center hover:bg-[#F0F5EE] py-1 px-1 rounded transition-colors group"
          >
            <div className="text-xs font-medium text-[#202521] truncate pr-2 flex items-center justify-between">
              <span className="truncate" title={stn.stationName}>
                {stn.stationName}
              </span>
              <span className="text-[10px] font-mono text-[#737B75] ml-1">{stn.city}</span>
            </div>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
              const val = stn.months[m];
              const colorClass = getCellColor(val);
              return (
                <div
                  key={m}
                  className={`h-7 rounded flex items-center justify-center font-mono text-[10px] cursor-default transition-transform hover:scale-105 ${colorClass}`}
                  title={`${stn.stationName} - ${months[m - 1]}: ${val ? `${val} µg/m³` : 'No data'}`}
                >
                  {val ? Math.round(val) : '—'}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

