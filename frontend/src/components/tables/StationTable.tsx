import React, { useState } from 'react';
import { StationItem } from '../../types';
import { SeverityChip } from '../cards/SeverityChip';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StationTableProps {
  stations: StationItem[];
  title?: string;
  subtitle?: string;
}

export const StationTable: React.FC<StationTableProps> = ({
  stations,
  title = 'Top Monitoring Stations Telemetry Ranking',
  subtitle = 'Accredited continuous ambient monitoring nodes ranked by particulate severity and capture integrity',
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = stations.filter(
    (s) =>
      s.stationName.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.state.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="bg-white rounded-xl border border-[#E9EDE9] shadow-xs p-6 flex flex-col gap-4">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div>
          <h2 className="text-base font-semibold text-[#202521]">{title}</h2>
          <p className="text-xs text-[#737B75]">{subtitle}</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2 text-[#737B75]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search station or city..."
              className="h-8 pl-8 pr-3 w-56 bg-[#F0F5EE] text-[#202521] placeholder:text-[#9DA6A0] text-xs rounded-lg border-0 focus:ring-1 focus:ring-[#055237]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F0F5EE] border-b border-[#E9EDE9] font-mono text-[10px] text-[#737B75] uppercase tracking-wider">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Station Name</th>
              <th className="py-2.5 px-3">City</th>
              <th className="py-2.5 px-3">State / UT</th>
              <th className="py-2.5 px-3 text-right">Avg PM2.5 (24h)</th>
              <th className="py-2.5 px-3 text-right">Avg PM10 (24h)</th>
              <th className="py-2.5 px-3 text-center">Data Capture</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-[#E9EDE9]">
            {paginated.map((stn, idx) => (
              <tr key={stn.stationId} className="hover:bg-[#F0F5EE]/60 transition-colors">
                <td className="py-2.5 px-3 font-mono text-[#737B75] font-semibold">
                  #{(page - 1) * pageSize + idx + 1 < 10 ? `0${(page - 1) * pageSize + idx + 1}` : (page - 1) * pageSize + idx + 1}
                </td>
                <td className="py-2.5 px-3 font-medium text-[#202521]">
                  <Link
                    to={`/stations/${stn.stationId}`}
                    className="hover:text-[#055237] hover:underline flex items-center gap-1.5"
                  >
                    <span>{stn.stationName}</span>
                  </Link>
                </td>
                <td className="py-2.5 px-3 text-[#58605c]">{stn.city}</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#737B75]">{stn.state}</td>
                <td className="py-2.5 px-3 text-right font-mono font-medium">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="tabular-nums font-semibold">{stn.avgPM25 || '—'} µg/m³</span>
                    <SeverityChip category={stn.tier} size="sm" />
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-[#737B75] tabular-nums">
                  {stn.avgPM10 ? `${stn.avgPM10} µg/m³` : '—'}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#055237] font-semibold tabular-nums">
                  {stn.dataCapturePct}%
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EAF3ED] text-[#055237] font-medium">
                    Operational
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E9EDE9] text-xs">
        <span className="text-[#737B75] font-mono text-[11px]">
          Displaying {paginated.length} of {filtered.length} active stations • 2025 CPCB Telemetry
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-2.5 py-1 text-xs font-mono rounded bg-[#F0F5EE] text-[#404943] hover:bg-[#E5E9E3] disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="font-mono text-xs text-[#202521] px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-2.5 py-1 text-xs font-mono rounded bg-[#F0F5EE] text-[#202521] hover:bg-[#E5E9E3] disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

