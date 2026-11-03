import React from 'react';
import {
  BookOpen,
  Calculator,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  FileCode2,
  ShieldCheck,
  Binary,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-[#E9EDE9] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#055237] tracking-wider uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Scientific Documentation • CPCB Technical Guidelines</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#202521]">Methodology & Data Engineering Standards</h1>
        <p className="text-xs text-[#737B75] max-w-3xl leading-relaxed">
          Comprehensive technical specifications governing the NorthAir Intelligence analytical pipeline, 
          Central Pollution Control Board (CPCB 2014) sub-index algorithms, DuckDB vectorized execution, and quality control protocols.
        </p>
      </div>

      {/* IND-AQI Mathematical Formulation */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E9EDE9]">
          <Calculator className="w-5 h-5 text-[#055237]" />
          <div>
            <h3 className="font-semibold text-sm text-[#202521]">1. CPCB National AQI Mathematical Formulation</h3>
            <p className="text-xs text-[#737B75]">Piecewise linear interpolation formula for sub-index computation</p>
          </div>
        </div>

        <p className="text-xs text-[#404943] leading-relaxed">
          The sub-index for any given pollutant parameter is calculated using the standard piecewise linear interpolation 
          mandated in the Central Pollution Control Board (CPCB) October 2014 technical report:
        </p>

        {/* Mathematical Display Box */}
        <div className="bg-[#FAFAF8] border border-[#E9EDE9] p-5 rounded-xl font-mono text-center flex flex-col items-center justify-center gap-2">
          <div className="text-sm font-bold text-[#055237]">
            I<sub>p</sub> = [ (I<sub>HI</sub> − I<sub>LO</sub>) / (B<sub>HI</sub> − B<sub>LO</sub>) ] × (C<sub>p</sub> − B<sub>LO</sub>) + I<sub>LO</sub>
          </div>
          <div className="text-[11px] text-[#737B75]">
            Composite AQI = max(I<sub>1</sub>, I<sub>2</sub>, ..., I<sub>n</sub>), with condition: n ≥ 3 pollutants and at least one PM species (PM2.5 or PM10)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
            <span className="font-bold text-[#055237] block font-mono">C<sub>p</sub></span>
            <span className="text-[#404943]">Observed 24-hour truncated average concentration of pollutant p.</span>
          </div>
          <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
            <span className="font-bold text-[#055237] block font-mono">B<sub>HI</sub>, B<sub>LO</sub></span>
            <span className="text-[#404943]">Upper and lower concentration breakpoints for the corresponding category.</span>
          </div>
          <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
            <span className="font-bold text-[#055237] block font-mono">I<sub>HI</sub>, I<sub>LO</sub></span>
            <span className="text-[#404943]">AQI values corresponding to B<sub>HI</sub> and B<sub>LO</sub> respectively.</span>
          </div>
          <div className="p-3 bg-[#F0F5EE] rounded-lg border border-[#E9EDE9]">
            <span className="font-bold text-[#055237] block font-mono">Responsible Pollutant</span>
            <span className="text-[#404943]">The pollutant with the highest sub-index defines the governing AQI.</span>
          </div>
        </div>
      </div>

      {/* CPCB Breakpoint Matrix Table */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-sm">
        <h3 className="font-semibold text-sm text-[#202521] mb-1">CPCB 2014 Breakpoint Reference Matrix</h3>
        <p className="text-xs text-[#737B75] mb-4">Official concentration intervals and associated health severity categories</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#FAFAF8] text-[#737B75] border-y border-[#E9EDE9]">
              <tr>
                <th className="py-2.5 px-3 font-sans">AQI Category</th>
                <th className="py-2.5 px-3">AQI Range</th>
                <th className="py-2.5 px-3">PM2.5 (24h)</th>
                <th className="py-2.5 px-3">PM10 (24h)</th>
                <th className="py-2.5 px-3">NO2 (24h)</th>
                <th className="py-2.5 px-3">SO2 (24h)</th>
                <th className="py-2.5 px-3">CO (8h)</th>
                <th className="py-2.5 px-3">Ozone (8h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDE9]">
              <tr className="bg-emerald-50/40">
                <td className="py-2 px-3 font-sans font-bold text-emerald-800">Good</td>
                <td className="py-2 px-3 text-[#202521]">0 – 50</td>
                <td className="py-2 px-3">0 – 30</td>
                <td className="py-2 px-3">0 – 50</td>
                <td className="py-2 px-3">0 – 40</td>
                <td className="py-2 px-3">0 – 40</td>
                <td className="py-2 px-3">0 – 1.0</td>
                <td className="py-2 px-3">0 – 50</td>
              </tr>
              <tr className="bg-green-50/40">
                <td className="py-2 px-3 font-sans font-bold text-green-800">Satisfactory</td>
                <td className="py-2 px-3 text-[#202521]">51 – 100</td>
                <td className="py-2 px-3">31 – 60</td>
                <td className="py-2 px-3">51 – 100</td>
                <td className="py-2 px-3">41 – 80</td>
                <td className="py-2 px-3">41 – 80</td>
                <td className="py-2 px-3">1.1 – 2.0</td>
                <td className="py-2 px-3">51 – 100</td>
              </tr>
              <tr className="bg-yellow-50/40">
                <td className="py-2 px-3 font-sans font-bold text-yellow-800">Moderate</td>
                <td className="py-2 px-3 text-[#202521]">101 – 200</td>
                <td className="py-2 px-3">61 – 90</td>
                <td className="py-2 px-3">101 – 250</td>
                <td className="py-2 px-3">81 – 180</td>
                <td className="py-2 px-3">81 – 380</td>
                <td className="py-2 px-3">2.1 – 10.0</td>
                <td className="py-2 px-3">101 – 168</td>
              </tr>
              <tr className="bg-orange-50/40">
                <td className="py-2 px-3 font-sans font-bold text-orange-800">Poor</td>
                <td className="py-2 px-3 text-[#202521]">201 – 300</td>
                <td className="py-2 px-3">91 – 120</td>
                <td className="py-2 px-3">251 – 350</td>
                <td className="py-2 px-3">181 – 280</td>
                <td className="py-2 px-3">381 – 800</td>
                <td className="py-2 px-3">10.1 – 17.0</td>
                <td className="py-2 px-3">169 – 208</td>
              </tr>
              <tr className="bg-red-50/40">
                <td className="py-2 px-3 font-sans font-bold text-red-800">Very Poor</td>
                <td className="py-2 px-3 text-[#202521]">301 – 400</td>
                <td className="py-2 px-3">121 – 250</td>
                <td className="py-2 px-3">351 – 430</td>
                <td className="py-2 px-3">281 – 400</td>
                <td className="py-2 px-3">801 – 1600</td>
                <td className="py-2 px-3">17.1 – 34.0</td>
                <td className="py-2 px-3">209 – 748</td>
              </tr>
              <tr className="bg-purple-50/40">
                <td className="py-2 px-3 font-sans font-bold text-purple-800">Severe</td>
                <td className="py-2 px-3 text-[#202521]">401 – 500</td>
                <td className="py-2 px-3">250+</td>
                <td className="py-2 px-3">430+</td>
                <td className="py-2 px-3">400+</td>
                <td className="py-2 px-3">1600+</td>
                <td className="py-2 px-3">34.0+</td>
                <td className="py-2 px-3">748+</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Preprocessing & Engineering Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-[#055237]" />
            <h3 className="font-semibold text-sm text-[#202521]">Physical Data Cleaning Guardrails</h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[#404943]">
            <div>
              <span className="font-semibold text-[#055237] block">UTC-to-IST Chronology Alignment</span>
              Raw CPCB telemetry recorded in UTC was shifted by +05:30 to align with Indian Standard Time, 
              ensuring that morning and evening peak traffic spikes match local solar diurnal cycles.
            </div>
            <div>
              <span className="font-semibold text-[#055237] block">Right-Censored Ceilings</span>
              PM2.5 values at 999.9 µg/m³ and PM10 at 1000.0 µg/m³ are flagged as sensor saturation rather than true maximums, 
              preserving physical instrumentation limits.
            </div>
            <div>
              <span className="font-semibold text-[#055237] block">Historical Separation (2017–2023 vs 2025)</span>
              Historical aggregated daily indices are maintained in distinct partitions from 2025 high-resolution hourly telemetry to prevent temporal conflation.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E9EDE9] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-[#055237]" />
            <h3 className="font-semibold text-sm text-[#202521]">DuckDB Vectorized Query Architecture</h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-[#404943]">
            <div>
              <span className="font-semibold text-[#055237] block">Zero-Copy Parquet Scans</span>
              DuckDB scans Apache Parquet files directly from disk utilizing SIMD vector instructions, reading only the projection columns required for each endpoint.
            </div>
            <div>
              <span className="font-semibold text-[#055237] block">Sub-100ms Aggregate Latency</span>
              Complex multi-table aggregations spanning 414,255 hourly records and 2.46M historical measurements execute in under 100ms without maintaining huge in-memory footprints.
            </div>
            <div>
              <span className="font-semibold text-[#055237] block">In-Memory Safe Serialization</span>
              Large 64-bit integer counts from DuckDB are automatically converted to standard JavaScript numeric types before JSON transport, preventing runtime serialization errors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

