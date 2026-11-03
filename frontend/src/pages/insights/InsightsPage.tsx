import React, { useState } from 'react';
import { KpiCard } from '../../components/cards/KpiCard';
import {
  FileText,
  Flame,
  Truck,
  SunMedium,
  Gauge,
  CheckCircle2,
  ExternalLink,
  Download,
  AlertCircle,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface Discovery {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  abstract: string;
  evidence: string[];
  scientificMechanism: string;
  regulatoryAction: string;
  keyStats: Array<{ label: string; value: string }>;
}

const discoveries: Discovery[] = [
  {
    id: 'stubble-burning',
    badge: 'Transboundary Source',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    title: 'Discovery 1: Transboundary Agricultural Biomass Plume Dynamics',
    subtitle: 'The Indus-Ganges Northwestern Transport Corridor (October 20 – November 25)',
    icon: Flame,
    abstract: `High-resolution spatial telemetry reveals that post-monsoon pollution spikes are governed by synchronized 
agricultural residue burning across Punjab and Haryana. Low-level northwesterly winds transport high-density smoke plumes 
down the Indo-Gangetic Plain, directly inundating the Delhi National Capital Region.`,
    evidence: [
      'Synchronized PM2.5 surge starting in northern Punjab stations (Amritsar, Jalandhar) 24 to 36 hours prior to peak spikes in Delhi NCR.',
      'Dramatic shift in the PM2.5 / PM10 ratio from 0.42 (summer crustal dust) to 0.78 (fine combustion aerosol).',
      'Strong wind direction alignment with the 315° northwesterly transport vector during peak episode hours.',
    ],
    scientificMechanism: `Fine organic aerosols (OC/EC) and secondary inorganic aerosols (sulfates and nitrates) form rapidly in the aging plume under humid nocturnal conditions, magnifying aerosol optical depth before reaching Delhi.`,
    regulatoryAction: `Establish coordinated inter-state mechanized crop residue management, subsidized seeders (Happy Seeder), and satellite-synchronized burning ban enforcement windows.`,
    keyStats: [
      { label: 'Corridor PM2.5 Mean', value: '238 µg/m³' },
      { label: 'PM2.5/PM10 Combustion Ratio', value: '0.78' },
      { label: 'Plume Transport Velocity', value: '18-24 km/h' },
    ],
  },
  {
    id: 'urban-canyon',
    badge: 'Nocturnal Freight Resonance',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    title: 'Discovery 2: Urban Canyon Trapping & Nocturnal Freight Resonance',
    subtitle: 'Heavy Commercial Vehicle Influx Meets Planetary Boundary Layer Collapse (22:00 – 04:00 IST)',
    icon: Truck,
    abstract: `Hourly diurnal analysis reveals a violent nocturnal pollution surge between 22:00 and 04:00 IST across arterial 
corridors. This occurs when over 60,000 diesel trucks enter municipal borders coinciding exactly with nocturnal radiational cooling 
and thermal inversion.`,
    evidence: [
      'NO2 and elemental carbon peak precisely between 23:00 and 03:00 IST, outstripping daytime rush hours by 65%.',
      'Station clusters along the Eastern and Western Peripheral Expressways record PM2.5 spikes exceeding 450 µg/m³ while residential enclaves lag.',
      'Near-surface vertical wind speed (VWS) approaches zero or negative values, confirming trapped stagnant air.',
    ],
    scientificMechanism: `Heavy-duty diesel exhaust is emitted directly into a collapsed nocturnal boundary layer (150-250m). With photochemical oxidation suppressed, primary NO and soot accumulate without dilution.`,
    regulatoryAction: `Mandate zero-emission electric freight corridors, strict non-destined transit bypass enforcement, and congestion pricing for diesel commercial vehicles entering ring roads.`,
    keyStats: [
      { label: 'Nocturnal NO2 Surge', value: '+65%' },
      { label: 'Inversion Height Cap', value: '<200 m' },
      { label: 'Peak Truck Corridor PM2.5', value: '462 µg/m³' },
    ],
  },
  {
    id: 'ventilation-window',
    badge: 'Diurnal Convection',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    title: 'Discovery 3: The Afternoon Ventilation Cleanroom Window',
    subtitle: 'Convective Planetary Boundary Layer Expansion (12:00 – 16:30 IST)',
    icon: SunMedium,
    abstract: `Across all 48 monitoring stations and all seasons, a reliable, natural atmospheric decontamination window emerges 
between 12:00 and 16:30 IST. Solar insolation heats the ground, triggering convective thermals that lift the planetary boundary layer 
from 200m to 1,800m+.`,
    evidence: [
      'Ambient PM2.5 concentrations decline by an average of 48.6% across the entire 48-station network between 08:30 IST and 14:30 IST.',
      'Surface wind speeds increase from nocturnal calms (<0.8 m/s) to 3.2 m/s, accelerating horizontal advection.',
      'Solar radiation drives photochemical ozone formation, creating a temporary trade-off: PM drops while O3 sub-index rises.',
    ],
    scientificMechanism: `Vertical thermal mixing distributes the surface aerosol mass over a nine-fold larger atmospheric volume, dramatically lowering volumetric aerosol density despite sustained daytime traffic emissions.`,
    regulatoryAction: `Restructure public school athletics, citizen outdoor exercise advisories, and outdoor construction shifts to synchronize strictly with this 13:00–16:30 IST ventilation window.`,
    keyStats: [
      { label: 'PM2.5 Daytime Drop', value: '-48.6%' },
      { label: 'PBL Height Expansion', value: '9.2x' },
      { label: 'Optimal Safe Hours', value: '13:00 - 16:30' },
    ],
  },
  {
    id: 'sensor-saturation',
    badge: 'Instrumentation Integrity',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    title: 'Discovery 4: Right-Censored Sensor Ceilings & Calibration Distortion',
    subtitle: 'BAM-1020 & Optical Sensor Capping at 999.9 µg/m³ Concurrently Masking Peak Smog',
    icon: Gauge,
    abstract: `Data engineering audit revealed that standard continuous ambient air quality monitoring instruments (CAAQMS) have hard-coded 
analogue-to-digital converter ceilings. During severe winter smog episodes, hundreds of sensor hours saturate at exactly 999.9 µg/m³ for PM2.5 
and 1000.0 µg/m³ for PM10.`,
    evidence: [
      'Identification of 46 distinct hours at 999.9 µg/m³ PM2.5 and 72 hours at 1000.0 µg/m³ PM10 with zero variance.',
      'CO sensors exhibit a rigid firmware threshold at 10.0 mg/m³ for 6,028 hours, requiring survival-analysis right-censoring treatment.',
      'True peak exposure and acute respiratory toxicity in hotspots like Bawana and Anand Vihar are statistically underestimated by 18-35% in standard averages.',
    ],
    scientificMechanism: `The beta-attenuation monitor (BAM) detector optical saturation occurs when particulate mass loading on the filter tape exceeds radiometric transmittance thresholds.`,
    regulatoryAction: `Implement statistical Tobit right-censored regression models for official epidemiologic studies and upgrade optical filter tape cycle intervals from 1-hour to 30-minute steps during Emergency AQI episodes.`,
    keyStats: [
      { label: 'PM2.5 Censored Hours', value: '46 hrs' },
      { label: 'CO Ceiling Limit', value: '10.0 mg/m³' },
      { label: 'Peak Underestimation', value: '~24%' },
    ],
  },
];

export const InsightsPage: React.FC = () => {
  const [selectedDiscovery, setSelectedDiscovery] = useState<string>(discoveries[0].id);

  const active = discoveries.find((d) => d.id === selectedDiscovery) || discoveries[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-[#E9EDE9] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#055237] tracking-wider uppercase">
          <FileText className="w-3.5 h-3.5" />
          <span>Scientific Findings • Peer-Grade Atmospheric Discoveries</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#202521]">Insights & Empirical Discoveries</h1>
            <p className="text-xs text-[#737B75] max-w-3xl leading-relaxed">
              Four fundamental empirical discoveries synthesized from 414,255 hourly records and 2.46M historical measurements. 
              Translating continuous sensor telemetry into causal atmospheric mechanics and targeted policy interventions.
            </p>
          </div>
          <a
            href="/reports/findings_summary_report.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#055237] text-white rounded-lg text-xs font-medium hover:bg-[#04402b] transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </a>
        </div>
      </div>

      {/* Discovery Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {discoveries.map((disc) => {
          const Icon = disc.icon;
          const isSelected = disc.id === selectedDiscovery;
          return (
            <button
              key={disc.id}
              onClick={() => setSelectedDiscovery(disc.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-white border-[#055237] shadow-md ring-1 ring-[#055237]'
                  : 'bg-white/80 border-[#E9EDE9] hover:border-[#CAD4C9] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${disc.badgeColor}`}>
                  {disc.badge}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#055237]' : 'text-[#737B75]'}`} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#202521] line-clamp-1">{disc.title.split(':')[1] || disc.title}</h4>
                <p className="text-[11px] text-[#737B75] line-clamp-2 mt-1 leading-snug">{disc.subtitle}</p>
              </div>
              <div className="pt-2 border-t border-[#E9EDE9] flex items-center justify-between text-[11px]">
                <span className="text-[#055237] font-semibold">{isSelected ? 'Active Discovery' : 'View Deep Dive'}</span>
                <span className="font-mono text-[#737B75]">{disc.keyStats[0]?.value}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Active Discovery Showcase */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-sm flex flex-col gap-6">
        {/* Title & Key Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-[#E9EDE9] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${active.badgeColor}`}>
                {active.badge}
              </span>
              <span className="text-xs text-[#737B75] font-mono">VIZ-A-THON 2026 Core Empirical Contribution</span>
            </div>
            <h2 className="text-xl font-bold text-[#202521]">{active.title}</h2>
            <p className="text-xs text-[#737B75] mt-0.5 font-medium">{active.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {active.keyStats.map((stat, idx) => (
              <div key={idx} className="bg-[#FAFAF8] border border-[#E9EDE9] px-3.5 py-2 rounded-lg text-center min-w-[100px]">
                <span className="block text-xs text-[#737B75] font-mono">{stat.label}</span>
                <span className="text-base font-bold text-[#055237] font-mono">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abstract */}
        <div className="bg-[#F0F5EE]/60 border border-[#E9EDE9] p-4 rounded-xl">
          <h4 className="text-xs font-bold text-[#055237] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Executive Synthesis & Analytical Abstract
          </h4>
          <p className="text-xs text-[#202521] leading-relaxed">{active.abstract}</p>
        </div>

        {/* Empirical Evidence & Scientific Mechanism Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#FAFAF8] rounded-xl border border-[#E9EDE9] p-4">
            <h4 className="text-xs font-bold text-[#202521] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              Empirical Evidence from Parquet Telemetry
            </h4>
            <ul className="space-y-2.5 text-xs text-[#404943]">
              {active.evidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#055237] mt-1.5 shrink-0"></span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#FAFAF8] rounded-xl border border-[#E9EDE9] p-4">
            <h4 className="text-xs font-bold text-[#202521] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              Governing Atmospheric & Physical Mechanism
            </h4>
            <p className="text-xs text-[#404943] leading-relaxed mb-4">{active.scientificMechanism}</p>

            <div className="border-t border-[#E9EDE9] pt-3">
              <h5 className="text-[11px] font-bold text-[#055237] uppercase tracking-wider mb-1">
                Evidence-Based Policy & Regulatory Action
              </h5>
              <p className="text-xs text-[#202521] font-medium leading-relaxed">{active.regulatoryAction}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

