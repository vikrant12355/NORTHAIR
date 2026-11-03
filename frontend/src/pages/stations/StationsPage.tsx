import React from 'react';
import { useStations } from '../../hooks/useStations';
import { StationTable } from '../../components/tables/StationTable';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import { Radio } from 'lucide-react';

export const StationsPage: React.FC = () => {
  const { stations, loading, error, refetch } = useStations();

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-mono text-[11px] font-semibold">
              <Radio className="w-3.5 h-3.5" />
              CAAQMS REGISTRY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            Station 360° Directory & Network Inventory
          </h1>
          <p className="text-xs text-[#737B75]">
            Complete roster of 48 continuous ambient air quality monitoring stations in Northern India.
          </p>
        </div>
      </div>

      <StationTable stations={stations} />
    </div>
  );
};

