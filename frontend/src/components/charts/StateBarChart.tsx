import React from 'react';
import { StateComparison } from '../../types';
import { SeverityChip } from '../cards/SeverityChip';

interface StateBarChartProps {
  data: StateComparison[];
}

export const StateBarChart: React.FC<StateBarChartProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
      {data.map((item) => {
        // Percentage against 150 µg/m³ scale
        const barWidth = Math.min(Math.round((item.meanPM25 / 150) * 100), 100);

        let barColor = 'bg-[#26966B]';
        let tier = 'Good';
        if (item.meanPM25 > 30 && item.meanPM25 <= 60) {
          barColor = 'bg-[#8EBB56]';
          tier = 'Satisfactory';
        } else if (item.meanPM25 > 60 && item.meanPM25 <= 90) {
          barColor = 'bg-[#E5B94F]';
          tier = 'Moderate';
        } else if (item.meanPM25 > 90 && item.meanPM25 <= 120) {
          barColor = 'bg-[#E58B38]';
          tier = 'Poor';
        } else if (item.meanPM25 > 120) {
          barColor = 'bg-[#BA1A1A]';
          tier = 'Very Poor';
        }

        return (
          <div
            key={item.state}
            className="bg-[#F0F5EE] p-3.5 rounded-xl flex flex-col justify-between gap-2.5 border border-[#E9EDE9]"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#202521]">{item.state}</span>
              <SeverityChip category={tier} />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tabular-nums text-[#202521]">
                  {item.meanPM25}
                </span>
                <span className="text-[10px] text-[#737B75]">µg/m³ PM2.5</span>
              </div>
              <div className="w-full bg-[#E5E9E3] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#737B75] font-mono">
              <span>{item.stationCount} CAAQMS</span>
              <span>PM10: {item.meanPM10} µg/m³</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

