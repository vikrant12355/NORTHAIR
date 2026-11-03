import React from 'react';
import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return <div className={`bg-[#F0F5EE] animate-pulse rounded-md ${className}`} />;
};

export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({ title = 'Telemetry Query Error', message = 'Failed to load telemetry data.', onRetry }) => {
  return (
    <div className="bg-white rounded-xl border border-[#BA1A1A]/20 p-8 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#BA1A1A]/10 flex items-center justify-center text-[#BA1A1A]">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#202521]">{title}</h3>
        <p className="text-xs text-[#737B75] mt-1 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-[#055237] text-white text-xs font-medium rounded-lg hover:bg-[#286b4e] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Query</span>
        </button>
      )}
    </div>
  );
};

export const EmptyState: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = 'No Telemetry Records Found',
  description = 'No sensor readings match the selected filters. Please adjust state, city or pollutant criteria.',
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#E9EDE9] p-8 flex flex-col items-center justify-center text-center gap-2">
      <div className="w-10 h-10 rounded-full bg-[#F0F5EE] flex items-center justify-center text-[#737B75]">
        <Inbox className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#202521]">{title}</h3>
      <p className="text-xs text-[#737B75] max-w-sm">{description}</p>
    </div>
  );
};

