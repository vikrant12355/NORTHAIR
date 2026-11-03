import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Flame,
  Activity,
  Wind,
  History,
  TrendingUp,
  FileText,
  Radio,
  Calendar,
  Clock,
  Layers,
  GitCompare,
  ShieldCheck,
  CheckCircle2,
  Database,
  BookOpen,
} from 'lucide-react';

interface NavSection {
  title: string;
  items: Array<{
    label: string;
    path: string;
    icon: React.ElementType;
  }>;
}

const navSections: NavSection[] = [
  {
    title: 'Intelligence Matrix',
    items: [
      { label: 'Overview', path: '/', icon: LayoutDashboard },
      { label: 'Regional Intelligence', path: '/regional', icon: MapPin },
      { label: 'Hotspot Explorer', path: '/hotspots', icon: Flame },
      { label: 'Pollutant Analytics', path: '/pollutants', icon: Activity },
      { label: 'Weather Intelligence', path: '/weather', icon: Wind },
      { label: 'Historical AQI', path: '/historical', icon: History },
      { label: 'Predictive Intelligence', path: '/predictive', icon: TrendingUp },
      { label: 'Insights & Reports', path: '/insights', icon: FileText },
    ],
  },
  {
    title: 'Advanced Analytics',
    items: [
      { label: 'Station 360° Profile', path: '/stations', icon: Radio },
      { label: 'Seasonal Intelligence', path: '/seasonal', icon: Calendar },
      { label: 'Diurnal Cycle Explorer', path: '/diurnal', icon: Clock },
      { label: 'Comparison Lab', path: '/comparison', icon: GitCompare },
      { label: 'Pollutant Relationships', path: '/pollutant-relationships', icon: Layers },
    ],
  },
  {
    title: 'Data & Trust',
    items: [
      { label: 'Data Quality Centre', path: '/quality', icon: ShieldCheck },
      { label: 'CPCB Standards & Compliance', path: '/compliance', icon: CheckCircle2 },
      { label: 'Data Explorer', path: '/explorer', icon: Database },
      { label: 'Methodology & Sources', path: '/methodology', icon: BookOpen },
    ],
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-[#E9EDE9] z-50 flex flex-col justify-between overflow-y-auto">
      <div className="flex flex-col">
        {/* Brand Banner */}
        <div className="p-5 flex flex-col gap-2 border-b border-[#E9EDE9]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#055237] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[22px]">air</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[17px] text-[#055237] tracking-tight leading-none">
                NORTHAIR
              </span>
              <span className="text-[10px] text-[#737B75] tracking-widest font-mono font-medium leading-none mt-1">
                INTELLIGENCE
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#737B75] leading-tight mt-1">
            Understanding Air. Revealing Patterns. Enabling Decisions.
          </p>
          <div className="flex items-center gap-2 mt-1 py-1 px-2.5 bg-[#F0F5EE] rounded-lg">
            <span className="h-2 w-2 rounded-full bg-[#055237] animate-pulse"></span>
            <span className="text-[11px] font-mono text-[#404943] font-medium">
              48 Stations Online • N. India Net
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="p-3 flex flex-col gap-5">
          {navSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-[#737B75] px-2.5 py-1 uppercase tracking-wider font-semibold">
                {section.title}
              </span>
              <nav className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'bg-[#286b4e] text-white shadow-sm'
                            : 'text-[#404943] hover:bg-[#F0F5EE] hover:text-[#181d19]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="p-4 border-t border-[#E9EDE9] bg-[#FAFAF8] flex items-center justify-between text-[11px] text-[#737B75] font-mono">
        <span>v4.2 CPCB Core</span>
        <span>Chandigarh HQ</span>
      </div>
    </aside>
  );
};

