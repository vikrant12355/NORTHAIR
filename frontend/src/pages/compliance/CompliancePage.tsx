import React from 'react';
import { KpiCard } from '../../components/cards/KpiCard';
import {
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldAlert,
  FileCheck2,
  Building,
  Info,
  ExternalLink,
} from 'lucide-react';

interface StandardItem {
  pollutant: string;
  chemicalFormula: string;
  averagingTime: string;
  naaqsLimit: string;
  observedMean: string;
  exceedanceRate: string;
  status: 'Attained' | 'Critical Non-Attainment' | 'Marginal Attainment';
}

const standards: StandardItem[] = [
  {
    pollutant: 'Particulate Matter 2.5',
    chemicalFormula: 'PM2.5',
    averagingTime: '24-Hour Mean',
    naaqsLimit: '60 µg/m³',
    observedMean: '118.4 µg/m³',
    exceedanceRate: '68.4% of days',
    status: 'Critical Non-Attainment',
  },
  {
    pollutant: 'Particulate Matter 10',
    chemicalFormula: 'PM10',
    averagingTime: '24-Hour Mean',
    naaqsLimit: '100 µg/m³',
    observedMean: '194.8 µg/m³',
    exceedanceRate: '71.2% of days',
    status: 'Critical Non-Attainment',
  },
  {
    pollutant: 'Nitrogen Dioxide',
    chemicalFormula: 'NO2',
    averagingTime: '24-Hour Mean',
    naaqsLimit: '80 µg/m³',
    observedMean: '42.6 µg/m³',
    exceedanceRate: '12.8% of days',
    status: 'Marginal Attainment',
  },
  {
    pollutant: 'Sulfur Dioxide',
    chemicalFormula: 'SO2',
    averagingTime: '24-Hour Mean',
    naaqsLimit: '80 µg/m³',
    observedMean: '14.2 µg/m³',
    exceedanceRate: '0.4% of days',
    status: 'Attained',
  },
  {
    pollutant: 'Carbon Monoxide',
    chemicalFormula: 'CO',
    averagingTime: '8-Hour Mean',
    naaqsLimit: '2.0 mg/m³',
    observedMean: '1.45 mg/m³',
    exceedanceRate: '18.2% of periods',
    status: 'Marginal Attainment',
  },
  {
    pollutant: 'Ozone',
    chemicalFormula: 'O3',
    averagingTime: '8-Hour Mean',
    naaqsLimit: '100 µg/m³',
    observedMean: '38.4 µg/m³',
    exceedanceRate: '6.2% of days',
    status: 'Attained',
  },
];

const grapStages = [
  {
    stage: 'Stage I',
    name: 'Poor Air Quality (AQI 201–300)',
    triggers: 'Strict ban on open burning, mechanical sweepers, anti-dust drives at construction sites.',
    color: 'border-amber-300 bg-amber-50/50',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    stage: 'Stage II',
    name: 'Very Poor Air Quality (AQI 301–400)',
    triggers: 'Diesel generator restrictions, augmented parking fees to discourage private vehicle usage, augmented metro and bus frequency.',
    color: 'border-orange-300 bg-orange-50/50',
    badge: 'bg-orange-100 text-orange-800',
  },
  {
    stage: 'Stage III',
    name: 'Severe Air Quality (AQI 401–450)',
    triggers: 'Ban on non-essential construction, demolition, stone crushers, and BS-III petrol / BS-IV diesel light motor vehicles.',
    color: 'border-red-300 bg-red-50/50',
    badge: 'bg-red-100 text-red-800',
  },
  {
    stage: 'Stage IV',
    name: 'Severe+ / Emergency (AQI > 450)',
    triggers: 'Commercial diesel truck entry ban, shutdown of primary schools, work-from-home advisories for 50% public and private workforce.',
    color: 'border-purple-300 bg-purple-50/50',
    badge: 'bg-purple-100 text-purple-800',
  },
];

export const CompliancePage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-[#E9EDE9] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#055237] tracking-wider uppercase">
          <Scale className="w-3.5 h-3.5" />
          <span>Statutory Framework • Ministry of Environment, Forest & Climate Change</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#202521]">CPCB Standards & Statutory Compliance</h1>
        <p className="text-xs text-[#737B75] max-w-3xl leading-relaxed">
          National Ambient Air Quality Standards (NAAQS) benchmark audit. Evaluating empirical pollutant observations 
          against statutory mandates under the Air (Prevention and Control of Pollution) Act, 1981, and Graded Response Action Plan (GRAP).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="PM2.5 Non-Attainment"
          value="100%"
          unit="48 / 48 Stations"
          subtitle="All monitoring sites exceed NAAQS Annual Limit (40 µg/m³)"
          variant="danger"
          badgeText="Non-Compliant"
        />
        <KpiCard
          title="PM10 Non-Attainment"
          value="100%"
          unit="48 / 48 Stations"
          subtitle="All monitoring sites exceed NAAQS Annual Limit (60 µg/m³)"
          variant="danger"
          badgeText="Non-Compliant"
        />
        <KpiCard
          title="SO2 Attainment"
          value="99.6%"
          unit="Compliant"
          subtitle="Sulfur dioxide consistently complies across all states"
          variant="success"
          badgeText="Full Compliance"
        />
        <KpiCard
          title="GRAP Emergency Days"
          value="42 Days"
          unit="AQI > 400"
          subtitle="Days triggering Stage III or Stage IV interventions in 2025"
          variant="warning"
          badgeText="Winter Episode"
        />
      </div>

      {/* NAAQS Benchmark Audit Table */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9EDE9] mb-4">
          <div>
            <h3 className="font-semibold text-sm text-[#202521]">NAAQS Statutory Exceedance Scoreboard</h3>
            <p className="text-xs text-[#737B75]">
              National Ambient Air Quality Standards Gazette Notification No. B-29016/20/90/PCI-L vs 2025 Observations
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] text-[#737B75] font-mono border-y border-[#E9EDE9]">
              <tr>
                <th className="py-2.5 px-3 font-sans">Pollutant</th>
                <th className="py-2.5 px-3">Formula</th>
                <th className="py-2.5 px-3">Averaging Standard</th>
                <th className="py-2.5 px-3">Statutory Limit</th>
                <th className="py-2.5 px-3">2025 Observed Mean</th>
                <th className="py-2.5 px-3">Exceedance Frequency</th>
                <th className="py-2.5 px-3 font-sans">Attainment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDE9] font-mono">
              {standards.map((std, idx) => (
                <tr key={idx} className="hover:bg-[#F0F5EE]/50 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-[#202521]">{std.pollutant}</td>
                  <td className="py-2.5 px-3 font-bold text-[#055237]">{std.chemicalFormula}</td>
                  <td className="py-2.5 px-3 text-[#737B75]">{std.averagingTime}</td>
                  <td className="py-2.5 px-3 text-[#202521] font-semibold">{std.naaqsLimit}</td>
                  <td className="py-2.5 px-3 font-bold text-[#DC2626]">{std.observedMean}</td>
                  <td className="py-2.5 px-3 text-[#737B75]">{std.exceedanceRate}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        std.status === 'Attained'
                          ? 'bg-emerald-100 text-emerald-800'
                          : std.status === 'Critical Non-Attainment'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {std.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRAP Matrix */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
        <h3 className="font-semibold text-sm text-[#202521] mb-1">Commission for Air Quality Management (CAQM) GRAP Framework</h3>
        <p className="text-xs text-[#737B75] mb-4">Graded Response Action Plan statutory emergency stages</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {grapStages.map((grap, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${grap.color}`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${grap.badge}`}>
                    {grap.stage}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#202521]">{grap.name}</h4>
                <p className="text-[11px] text-[#404943] leading-relaxed mt-2">{grap.triggers}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

