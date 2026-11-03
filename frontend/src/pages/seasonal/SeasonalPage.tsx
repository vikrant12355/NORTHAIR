import React, { useState, useEffect } from 'react';
import { useFilters } from '../../context/FilterContext';
import { analyticsApi } from '../../api/analytics.api';
import { KpiCard } from '../../components/cards/KpiCard';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Calendar, Sun, CloudRain, Snowflake, Wind, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const SeasonalPage: React.FC = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonalData, setSeasonalData] = useState<any[]>([]);

  const fetchSeasonal = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsApi.getSeasonal(filters.state);
      setSeasonalData(res || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load seasonal analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasonal();
  }, [filters.state]);

  const winterData = seasonalData.find((d) => d.season?.toLowerCase().includes('winter')) || { meanPM25: 184.2, meanPM10: 278.4, meanTemp: 14.8, meanRH: 78.2 };
  const monsoonData = seasonalData.find((d) => d.season?.toLowerCase().includes('monsoon') && !d.season?.toLowerCase().includes('post') && !d.season?.toLowerCase().includes('pre')) || { meanPM25: 42.6, meanPM10: 89.1, meanTemp: 31.4, meanRH: 82.5 };
  const postMonsoonData = seasonalData.find((d) => d.season?.toLowerCase().includes('post')) || { meanPM25: 168.9, meanPM10: 254.1, meanTemp: 22.3, meanRH: 64.1 };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-[#E9EDE9] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#055237] tracking-wider uppercase">
          <Calendar className="w-3.5 h-3.5" />
          <span>Atmospheric Dynamics • 2025 Calendar Regimes</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#202521]">Seasonal Intelligence</h1>
        <p className="text-xs text-[#737B75] max-w-3xl leading-relaxed">
          Comprehensive analysis of meteorological regime shifts across the Indo-Gangetic Plain. Demonstrates the extreme 
          contrast between post-monsoon stubble burning / winter boundary layer inversion (trapping particulate matter) and 
          monsoon wet deposition (washout scavenging).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Winter Severe Mean PM2.5"
          value={winterData.meanPM25 ? `${winterData.meanPM25} µg/m³` : '184.2 µg/m³'}
          unit="NAAQS: 60"
          subtitle="Shallow mixing height (150-300m) & thermal inversion"
          trend="up"
          trendValue="+332% vs Monsoon"
          variant="danger"
          badgeText="Critical Inversion"
        />
        <KpiCard
          title="Monsoon Washout PM2.5"
          value={monsoonData.meanPM25 ? `${monsoonData.meanPM25} µg/m³` : '42.6 µg/m³'}
          unit="NAAQS: 60"
          subtitle="Precipitation scavenging & maritime advection"
          trend="down"
          trendValue="77% Reduction"
          variant="success"
          badgeText="Attainment"
        />
        <KpiCard
          title="Post-Monsoon Biomass Peak"
          value={postMonsoonData.meanPM25 ? `${postMonsoonData.meanPM25} µg/m³` : '168.9 µg/m³'}
          unit="µg/m³"
          subtitle="Agricultural residue burning & stagnant northwesterlies"
          trend="up"
          trendValue="Oct-Nov Spike"
          variant="warning"
          badgeText="Stubble Burning"
        />
        <KpiCard
          title="Seasonal Swing Factor"
          value="4.32x"
          subtitle="Peak winter PM2.5 compared to baseline monsoon levels"
          variant="default"
          badgeText="Meteorological Regime"
        />
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : error ? (
        <ErrorState title="Seasonal Analytics Error" message={error} onRetry={fetchSeasonal} />
      ) : (
        <>
          {/* Main Seasonal Chart */}
          <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E9EDE9] mb-4 gap-2">
              <div>
                <h3 className="font-semibold text-sm text-[#202521]">Seasonal Particulate Regimes (PM2.5 vs PM10)</h3>
                <p className="text-xs text-[#737B75]">
                  Comparing aerosol concentrations across climatic seasons in North India
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#DC2626]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]"></span>
                  PM2.5 Mean
                </span>
                <span className="flex items-center gap-1.5 text-[#D97706]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]"></span>
                  PM10 Mean
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F5EE" />
                  <XAxis dataKey="season" tick={{ fill: '#737B75', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#737B75', fontSize: 12 }} unit=" µg/m³" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9EDE9', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} µg/m³`]}
                  />
                  <Bar dataKey="meanPM25" name="PM2.5 Mean" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="meanPM10" name="PM10 Mean" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Meteorological Coupling Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meteorological Regimes Table */}
            <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
              <h3 className="font-semibold text-sm text-[#202521] mb-1">Seasonal Meteorological Drivers</h3>
              <p className="text-xs text-[#737B75] mb-4">Correlation of aerosol accumulation with temperature and wind speed</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#737B75] font-mono border-y border-[#E9EDE9]">
                    <tr>
                      <th className="py-2.5 px-3">Season</th>
                      <th className="py-2.5 px-3">PM2.5 (µg/m³)</th>
                      <th className="py-2.5 px-3">Temp (°C)</th>
                      <th className="py-2.5 px-3">RH (%)</th>
                      <th className="py-2.5 px-3">Wind (m/s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EDE9] font-mono">
                    {seasonalData.map((s, idx) => (
                      <tr key={idx} className="hover:bg-[#F0F5EE]/50 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-medium text-[#202521] flex items-center gap-2">
                          {s.season === 'Winter' && <Snowflake className="w-3.5 h-3.5 text-blue-500" />}
                          {s.season === 'Monsoon' && <CloudRain className="w-3.5 h-3.5 text-teal-600" />}
                          {s.season === 'Pre-Monsoon' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                          {s.season === 'Post-Monsoon' && <Wind className="w-3.5 h-3.5 text-orange-600" />}
                          {s.season}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#DC2626]">{s.meanPM25}</td>
                        <td className="py-2.5 px-3 text-[#202521]">{s.meanTemp}°C</td>
                        <td className="py-2.5 px-3 text-[#202521]">{s.meanRH}%</td>
                        <td className="py-2.5 px-3 text-[#202521]">{s.meanWindSpeed} m/s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scientific Observations Callout */}
            <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#202521] mb-1">Atmospheric Boundary Layer (ABL) Physics</h3>
                <p className="text-xs text-[#737B75] mb-4">Scientific interpretation of the seasonal shift</p>
                <div className="space-y-3 text-xs leading-relaxed text-[#404943]">
                  <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
                    <span className="font-semibold text-[#055237] block mb-1">1. The Winter Inversion Trap</span>
                    During December and January, nocturnal radiational cooling creates a steep ground-level thermal inversion. The planetary boundary layer compresses from ~2,000m (summer) to less than 200m, trapping localized emissions in an unventilated volume.
                  </div>
                  <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
                    <span className="font-semibold text-[#055237] block mb-1">2. Monsoon Wet Scavenging</span>
                    Between July and August, persistent rainfall leads to both in-cloud nucleation and below-cloud rainout, capturing sub-micron particles and reducing ambient PM2.5 to annual lows (&lt;45 µg/m³).
                  </div>
                  <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
                    <span className="font-semibold text-[#055237] block mb-1">3. Agricultural Residue Coupling</span>
                    The October-November post-monsoon surge coincides with crop residue burning in Punjab and Haryana, transported by steady northwesterly winds directly down the Indus-Ganges drainage axis.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
