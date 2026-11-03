import React from 'react';

export interface KpiCardProps {
  label?: string;
  title?: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  badgeText?: string;
  trend?: 'up' | 'down' | 'neutral' | string;
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | string;
  footerLeft?: React.ReactNode;
  footerRight?: string;
  accentColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  title,
  value,
  unit,
  subtext,
  subtitle,
  badge,
  badgeText,
  trend,
  trendValue,
  variant = 'default',
  footerLeft,
  footerRight,
}) => {
  const displayLabel = label || title || '';
  const displaySubtext = subtext || subtitle || '';

  const getVariantBadgeClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-[#F0F5EE] text-[#404943] border-[#E9EDE9]';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E9EDE9] p-4 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#737B75] uppercase tracking-wider font-semibold">
          {displayLabel}
        </span>
        {badge ? (
          badge
        ) : badgeText ? (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getVariantBadgeClass()}`}>
            {badgeText}
          </span>
        ) : null}
      </div>

      <div className="my-2">
        <div className="flex items-baseline gap-1">
          <span className="text-[32px] font-semibold text-[#202521] tracking-tight tabular-nums leading-none">
            {value}
          </span>
          {unit && <span className="text-xs text-[#737B75] font-normal">{unit}</span>}
        </div>
        {displaySubtext && <p className="text-[11px] text-[#737B75] mt-1 leading-snug">{displaySubtext}</p>}
      </div>

      {(footerLeft || footerRight || trendValue) && (
        <div className="pt-2 border-t border-[#F0F5EE] flex items-center justify-between text-[11px]">
          <div className="flex items-center">
            {footerLeft || (trendValue && (
              <span className={`font-mono text-[11px] font-semibold ${
                trend === 'down' ? 'text-emerald-700' : trend === 'up' ? 'text-red-700' : 'text-[#737B75]'
              }`}>
                {trendValue}
              </span>
            ))}
          </div>
          {footerRight && <span className="text-[#9DA6A0] text-[10px]">{footerRight}</span>}
        </div>
      )}
    </div>
  );
};

