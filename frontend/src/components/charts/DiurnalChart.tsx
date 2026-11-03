import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface DiurnalDataPoint {
  hour: number;
  pm25Mean: number;
  pm25Median?: number;
  pm10Mean?: number;
  wsMean?: number;
  pm25StdDev?: number;
}

interface DiurnalChartProps {
  data: DiurnalDataPoint[];
}

export const DiurnalChart: React.FC<DiurnalChartProps> = ({ data }) => {
  const chartData = data.map((d) => ({
    hourLabel: `${String(d.hour).padStart(2, '0')}:00`,
    pm25: d.pm25Mean,
    pm10: d.pm10Mean,
    windSpeed: d.wsMean,
    upperBound: Number((d.pm25Mean + (d.pm25StdDev || 15) * 0.5).toFixed(1)),
    lowerBound: Number(Math.max(10, d.pm25Mean - (d.pm25StdDev || 15) * 0.5).toFixed(1)),
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="diurnalCorridor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#286b4e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#286b4e" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="hourLabel"
            tick={{ fontSize: 10, fill: '#737B75', fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={{ stroke: '#E9EDE9' }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#737B75', fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-[#D6DCD7] p-2.5 rounded-lg shadow-md text-xs font-mono">
                    <p className="font-semibold text-[#202521] mb-1">{label} IST</p>
                    <p className="text-[#055237]">
                      PM2.5: <span className="font-bold">{payload.find((p) => p.dataKey === 'pm25')?.value}</span> µg/m³
                    </p>
                    <p className="text-[#58605c]">
                      PM10: <span className="font-bold">{payload.find((p) => p.dataKey === 'pm10')?.value}</span> µg/m³
                    </p>
                    <p className="text-[#BA6828]">
                      Wind Speed: <span className="font-bold">{payload.find((p) => p.dataKey === 'windSpeed')?.value}</span> m/s
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Uncertainty corridor */}
          <Area
            type="monotone"
            dataKey="upperBound"
            stroke="none"
            fill="url(#diurnalCorridor)"
          />

          {/* Primary PM2.5 Trajectory */}
          <Line
            type="monotone"
            dataKey="pm25"
            name="PM2.5"
            stroke="#055237"
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: '#055237' }}
          />

          {/* Secondary PM10 Line */}
          <Line
            type="monotone"
            dataKey="pm10"
            name="PM10"
            stroke="#707973"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

