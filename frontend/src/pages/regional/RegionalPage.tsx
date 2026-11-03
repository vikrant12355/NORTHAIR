import React from 'react';
import { useStations } from '../../hooks/useStations';
import { SpatialMap } from '../../components/charts/SpatialMap';
import { StateBarChart } from '../../components/charts/StateBarChart';
import { useOverview } from '../../hooks/useOverview';
import { Skeleton, ErrorState } from '../../components/ui/StatusStates';
import { MapPin, Globe } from 'lucide-react';

export const RegionalPage: React.FC = () => {
  const { stations, loading, error, refetch } = useStations();
  const { regionalComparison } = useOverview();

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-[460px] rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E9EDE9]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#055237] font-mono text-[11px] font-semibold">
              <Globe className="w-3.5 h-3.5" />
              GIS SPATIAL TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#202521] tracking-tight">
            Regional Intelligence & Sub-Continental Mesh
          </h1>
          <p className="text-xs text-[#737B75]">
            Spatio-temporal particulate clustering and air basin transport dynamics across Chandigarh,
            Punjab, Haryana, and Delhi NCT.
          </p>
        </div>
      </div>

      {/* Interactive GIS Spatial Map & Station Drawer */}
      <SpatialMap stations={stations} />

      {/* State-by-State Exposure Disparity */}
      <div className="bg-white rounded-xl border border-[#E9EDE9] p-6 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9EDE9]">
          <div>
            <h2 className="text-base font-semibold text-[#202521]">
              Territorial Exposure Comparison
            </h2>
            <p className="text-xs text-[#737B75]">
              Aggregate baseline particulate load across North Indian administrative zones
            </p>
          </div>
        </div>
        <StateBarChart data={regionalComparison} />
      </div>
    </div>
  );
};

