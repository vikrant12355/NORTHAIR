import React, { useState } from 'react';
import { useFilters } from '../../context/FilterContext';
import { KpiCard } from '../../components/cards/KpiCard';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Wind,
  CloudFog,
  Cpu,
  Layers,
  ThermometerSnowflake,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const PredictivePage: React.FC = () => {
  const { filters } = useFilters();
  const [scenario, setScenario] = useState<'baseline' | 'stagnant' | 'biomass'>('baseline');

  // Baseline 24-48h projection data based on dynamic meteorological coupling
  const projections = [
    { hour: '00:00', baseline: 184, stagnant: 245, biomass: 310, ventilation: 2100, risk: 'High' },
    { hour: '03:00', baseline: 198, stagnant: 275, biomass: 345, ventilation: 1800, risk: 'Severe' },
    { hour: '06:00', baseline: 242, stagnant: 340, biomass: 420, ventilation: 1400, risk: 'Emergency' },
    { hour: '09:00', baseline: 220, stagnant: 310, biomass: 390, ventilation: 2600, risk: 'Severe' },
    { hour: '12:00', baseline: 145, stagnant: 195, biomass: 260, ventilation: 5200, risk: 'Moderate' },
    { hour: '15:00', baseline: 120, stagnant: 160, biomass: 210, ventilation: 6100, risk: 'Moderate' },
    { hour: '18:00', baseline: 175, stagnant: 230, biomass: 295, ventilation: 3400, risk: 'Poor' },
    { hour: '21:00', baseline: 215, stagnant: 290, biomass: 380, ventilation: 2200, risk: 'Severe' },
    { hour: '24:00', baseline: 205, stagnant: 280, biomass: 360, ventilation: 1950, risk: 'Severe' },
  ];

  const getActiveDataKey = () => {
    if (scenario === 'stagnant') return 'stagnant';
    if (scenario === 'biomass') return 'biomass';
    return 'baseline';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-[#E9EDE9] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#055237] tracking-wider uppercase">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Anticipatory Modeling • Atmospheric Dispersion Physics</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#202521]">Predictive Intelligence</h1>
        <p className="text-xs text-[#737B75] max-w-3xl leading-relaxed">
          Near-term episodic forecasting and thermal boundary-layer alert models. Combines real-time 
          planetary boundary layer (PBL) ventilation coefficients, downdraft subsidence, and upstream emissions 
          to forecast severe air-stagnation episodes 24 to 48 hours in advance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ventilation Index"
          value="1,840 m²/s"
          unit="Crit &lt; 2,000"
          subtitle="Ventilation Coefficient (PBL × Wind Speed)"
          trend="down"
          trendValue="Trapping Aerosols"
          variant="danger"
          badgeText="Poor Ventilation"
        />
        <KpiCard
          title="Inversion Probability"
          value="87.4%"
          subtitle="Ground radiation cooling & calm boundary winds"
          trend="up"
          trendValue="Likely Tonight"
          variant="warning"
          badgeText="High Confidence"
        />
        <KpiCard
          title="Saturation Ceiling Risk"
          value="4 Stations"
          subtitle="Sensors projected to exceed 999.9 µg/m³"
          variant="danger"
          badgeText="Right-Censored Alert"
        />
        <KpiCard
          title="Optimal Ventilation Window"
          value="13:00 - 16:30"
          subtitle="Maximum solar boundary layer expansion"
          variant="success"
          badgeText="Lowest Daily Exposure"
        />
      </div>

      {/* Scenario Controls & Projections */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E9EDE9] gap-3">
          <div>
            <h3 className="font-semibold text-sm text-[#202521]">24-Hour Anticipatory PM2.5 Trajectory Forecast</h3>
            <p className="text-xs text-[#737B75]">
              Simulating atmospheric loading under dynamic meteorological scenarios
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#F0F5EE] p-1 rounded-lg border border-[#E9EDE9]">
            <button
              onClick={() => setScenario('baseline')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                scenario === 'baseline'
                  ? 'bg-white text-[#055237] shadow-sm font-semibold'
                  : 'text-[#737B75] hover:text-[#202521]'
              }`}
            >
              Standard Baseline
            </button>
            <button
              onClick={() => setScenario('stagnant')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                scenario === 'stagnant'
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'text-[#737B75] hover:text-[#202521]'
              }`}
            >
              Calm Inversion (&lt;1 m/s)
            </button>
            <button
              onClick={() => setScenario('biomass')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                scenario === 'biomass'
                  ? 'bg-red-600 text-white shadow-sm font-semibold'
                  : 'text-[#737B75] hover:text-[#202521]'
              }`}
            >
              Biomass Spike (+Upstream)
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={scenario === 'biomass' ? '#DC2626' : scenario === 'stagnant' ? '#D97706' : '#055237'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={scenario === 'biomass' ? '#DC2626' : scenario === 'stagnant' ? '#D97706' : '#055237'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F5EE" />
              <XAxis dataKey="hour" tick={{ fill: '#737B75', fontSize: 12 }} />
              <YAxis tick={{ fill: '#737B75', fontSize: 12 }} unit=" µg/m³" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9EDE9', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${val} µg/m³`, 'Projected PM2.5']}
              />
              <Area
                type="monotone"
                dataKey={getActiveDataKey()}
                stroke={scenario === 'biomass' ? '#DC2626' : scenario === 'stagnant' ? '#D97706' : '#055237'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#forecastGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dispersion Alert Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CloudFog className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-sm text-[#202521]">Thermal Inversion Index</h3>
          </div>
          <p className="text-xs text-[#737B75] mb-4">
            Ground-level temperature cooling below 12°C with low vertical mixing creates an impervious aerosol cap.
          </p>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-2.5 bg-[#FAFAF8] rounded border border-[#E9EDE9]">
              <span className="text-[#737B75]">Nocturnal Delta T (850hPa - Sfc)</span>
              <span className="font-bold text-[#DC2626]">+4.8 °C (Strong Cap)</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#FAFAF8] rounded border border-[#E9EDE9]">
              <span className="text-[#737B75]">Mixing Height</span>
              <span className="font-bold text-amber-600">220 meters</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#FAFAF8] rounded border border-[#E9EDE9]">
              <span className="text-[#737B75]">Inversion Onset</span>
              <span className="text-[#202521]">20:30 IST</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#FAFAF8] rounded border border-[#E9EDE9]">
              <span className="text-[#737B75]">Breakup Forecast</span>
              <span className="text-[#055237]">10:15 IST Next Morning</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-sm text-[#202521]">Cluster Vulnerability Alert</h3>
          </div>
          <p className="text-xs text-[#737B75] mb-4">
            Regional clusters facing highest episodic escalation over the next 24 hours.
          </p>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-red-50/60 rounded-lg border border-red-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-red-900 block">Delhi NCR (Bawana / Anand Vihar)</span>
                <span className="text-[11px] text-red-700">Projected AQI: 440+ (Severe+)</span>
              </div>
              <span className="px-2 py-0.5 bg-red-600 text-white font-mono rounded text-[10px] font-bold">CRITICAL</span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-amber-900 block">Punjab Agricultural Belt (Ludhiana)</span>
                <span className="text-[11px] text-amber-700">Projected AQI: 360 (Very Poor)</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-600 text-white font-mono rounded text-[10px] font-bold">WARNING</span>
            </div>
            <div className="p-3 bg-yellow-50/60 rounded-lg border border-yellow-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-yellow-900 block">Haryana Industrial Corridor (Faridabad)</span>
                <span className="text-[11px] text-yellow-700">Projected AQI: 330 (Very Poor)</span>
              </div>
              <span className="px-2 py-0.5 bg-yellow-600 text-white font-mono rounded text-[10px] font-bold">WATCH</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#055237]" />
            <h3 className="font-semibold text-sm text-[#202521]">Automated Advisory Engine</h3>
          </div>
          <p className="text-xs text-[#737B75] mb-4">
            Algorithmic public health and regulatory intervention recommendations.
          </p>
          <div className="space-y-3 text-xs leading-relaxed text-[#404943]">
            <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
              <span className="font-semibold text-[#055237] block mb-0.5">Municipal Dust Suppression</span>
              Deploy mechanical street sweepers and anti-smog water misters between 05:00 and 08:30 IST prior to morning rush hour.
            </div>
            <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
              <span className="font-semibold text-[#055237] block mb-0.5">Heavy Freight Diversion</span>
              Activate peripheral expressway diversion for non-essential commercial diesel trucks between 22:00 and 06:00 IST.
            </div>
            <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
              <span className="font-semibold text-[#055237] block mb-0.5">Vulnerable Population Notice</span>
              Advise asthmatic and pediatric cohorts to reschedule outdoor physical exertion to the optimal ventilation window (13:00 - 16:30 IST).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

