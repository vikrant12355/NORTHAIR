import React from 'react';
import { useGlobalFilters } from '../../context/FilterContext';
import { RotateCcw, Filter } from 'lucide-react';

export const GlobalFilterBar: React.FC = () => {
  const { filters, setFilter, resetFilters, options } = useGlobalFilters();

  const filteredCities =
    filters.state === 'ALL'
      ? options.cities
      : options.cities.filter((c) => c.state === filters.state);

  const filteredStations =
    filters.state === 'ALL'
      ? options.stations
      : options.stations.filter((s) => s.state === filters.state);

  return (
    <div className="bg-white rounded-xl border border-[#E9EDE9] shadow-xs p-3 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 flex-1">
        {/* State Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-[#737B75] uppercase tracking-wider px-1 font-semibold">
            Region / State
          </label>
          <select
            value={filters.state}
            onChange={(e) => setFilter('state', e.target.value)}
            className="w-full h-8 pl-2 pr-6 bg-[#F0F5EE] text-[#202521] text-xs rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-[#055237]"
          >
            <option value="ALL">All States (4 Zones)</option>
            {options.states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-[#737B75] uppercase tracking-wider px-1 font-semibold">
            Urban Aggr. / City
          </label>
          <select
            value={filters.city}
            onChange={(e) => setFilter('city', e.target.value)}
            className="w-full h-8 pl-2 pr-6 bg-[#F0F5EE] text-[#202521] text-xs rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-[#055237]"
          >
            <option value="ALL">All Monitored Cities</option>
            {filteredCities.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.state})
              </option>
            ))}
          </select>
        </div>

        {/* Station Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-[#737B75] uppercase tracking-wider px-1 font-semibold">
            Station Grid
          </label>
          <select
            value={filters.stationId}
            onChange={(e) => setFilter('stationId', e.target.value)}
            className="w-full h-8 pl-2 pr-6 bg-[#F0F5EE] text-[#202521] text-xs rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-[#055237]"
          >
            <option value="ALL">All 48 CAAQMS Stations</option>
            {filteredStations.map((stn) => (
              <option key={stn.id} value={stn.id}>
                {stn.name.length > 25 ? `${stn.name.substring(0, 25)}...` : stn.name}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Vector / Pollutant */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-[#737B75] uppercase tracking-wider px-1 font-semibold">
            Primary Vector
          </label>
          <select
            value={filters.pollutant}
            onChange={(e) => setFilter('pollutant', e.target.value)}
            className="w-full h-8 pl-2 pr-6 bg-[#F0F5EE] text-[#202521] text-xs rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-[#055237]"
          >
            {options.pollutants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Granularity */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-[#737B75] uppercase tracking-wider px-1 font-semibold">
            Resolution
          </label>
          <select
            value={filters.resolution}
            onChange={(e) => setFilter('resolution', e.target.value)}
            className="w-full h-8 pl-2 pr-6 bg-[#F0F5EE] text-[#202521] text-xs rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-[#055237]"
          >
            {options.resolutions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-end gap-2">
          <button
            onClick={resetFilters}
            className="h-8 px-3 bg-[#F0F5EE] hover:bg-[#E5E9E3] text-[#404943] text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer w-full justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#737B75]" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

