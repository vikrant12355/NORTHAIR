import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrajectoryPoint } from '../../types';

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#055237" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#055237" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="pm10Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#707973" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#707973" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            tickFormatter={(str) => (str ? str.substring(5) : '')}
            tick={{ fontSize: 11, fill: '#737B75', fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={{ stroke: '#E9EDE9' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#737B75', fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={false}
          />

          {/* NAAQS Regulatory Threshold Reference Lines */}
          <ReferenceLine
            y={60}
            stroke="#286b4e"
            strokeDasharray="3 3"
            label={{
              value: 'NAAQS PM2.5 (60)',
              fill: '#286b4e',
              fontSize: 10,
              position: 'right',
            }}
          />
          <ReferenceLine
            y={100}
            stroke="#8a6805"
            strokeDasharray="3 3"
            label={{
              value: 'NAAQS PM10 (100)',
              fill: '#8a6805',
              fontSize: 10,
              position: 'right',
            }}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-[#D6DCD7] p-2.5 rounded-lg shadow-md text-xs font-mono">
                    <p className="font-semibold text-[#202521] mb-1">{label}</p>
                    <p className="text-[#055237]">
                      PM2.5: <span className="font-bold">{payload[0]?.value}</span> µg/m³
                    </p>
                    {payload[1] && (
                      <p className="text-[#58605c]">
                        PM10: <span className="font-bold">{payload[1]?.value}</span> µg/m³
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="pm25"
            name="PM2.5"
            stroke="#055237"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#pm25Gradient)"
          />
          <Line
            type="monotone"
            dataKey="pm10"
            name="PM10"
            stroke="#707973"
            strokeWidth={1.5}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

