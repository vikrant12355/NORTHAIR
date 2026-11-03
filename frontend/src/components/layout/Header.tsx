import React from 'react';
import { Download, RefreshCw, ChevronRight, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/': 'North India Air Quality Overview',
  '/regional': 'Regional Intelligence & GIS Mesh',
  '/hotspots': 'Hotspot Explorer & Exceedance Rankings',
  '/pollutants': 'Multi-Pollutant Analytics & Vectors',
  '/weather': 'Weather Intelligence & Dispersion Dynamics',
  '/historical': 'Longitudinal Historical AQI (2017–2023)',
  '/predictive': 'Predictive Intelligence & Inversion Modeling',
  '/insights': 'Executive Insights & Empirical Findings',
  '/stations': 'Station 360° Comprehensive Profile',
  '/seasonal': 'Seasonal Regime Shifts & Monsoon Washout',
  '/diurnal': '24-Hour Diurnal Dynamics (IST UTC+05:30)',
  '/comparison': 'Multi-Station & City Comparison Lab',
  '/pollutant-relationships': 'Pollutant Relationship & Titration Lab',
  '/quality': 'Data Quality Centre & Audit Logs',
  '/compliance': 'CPCB Standards & Statutory Compliance',
  '/explorer': 'Raw Telemetry & Metric Data Explorer',
  '/methodology': 'Scientific Methodology & Breakpoint Formulas',
};

export const Header: React.FC = () => {
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || 'Telemetry Workstation';

  const handleExport = () => {
    window.open('/api/exports/measurements.csv?limit=5000', '_blank');
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#E9EDE9] z-40 flex items-center justify-between px-8">
      {/* Breadcrumb & Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#737B75]">
          <span>Telemetry</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#9DA6A0]" />
          <span className="font-semibold text-[#055237]">{currentTitle}</span>
        </div>
        <div className="h-4 w-px bg-[#E9EDE9]"></div>
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF3ED] text-[#055237] rounded-full text-[11px] font-mono font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-[#286b4e] animate-pulse"></span>
          <span>48 CAAQMS Stations Operational</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F0F5EE] rounded-lg text-xs text-[#404943] font-mono">
          <RefreshCw className="w-3.5 h-3.5 text-[#055237]" />
          <span>2025 Validated • CPCB Synced</span>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-[#E9EDE9] hover:bg-[#FAFAF8] text-[#202521] rounded-lg shadow-xs text-xs font-medium transition-colors cursor-pointer"
          title="Download filtered dataset in CSV format"
        >
          <Download className="w-3.5 h-3.5 text-[#055237]" />
          <span>Export CSV</span>
        </button>

        <div className="h-5 w-px bg-[#E9EDE9]"></div>

        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#055237] flex items-center justify-center text-white text-xs font-semibold shadow-xs">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};

