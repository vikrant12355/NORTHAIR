import React from 'react';
import { AQICategory } from '../../types';

interface SeverityChipProps {
  category: AQICategory | string;
  size?: 'sm' | 'md';
}

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Good: {
    bg: 'bg-[#26966B]/10',
    text: 'text-[#26966B]',
    dot: 'bg-[#26966B]',
  },
  Satisfactory: {
    bg: 'bg-[#8EBB56]/15',
    text: 'text-[#4d7221]',
    dot: 'bg-[#8EBB56]',
  },
  Moderate: {
    bg: 'bg-[#E5B94F]/15',
    text: 'text-[#8a6805]',
    dot: 'bg-[#E5B94F]',
  },
  Poor: {
    bg: 'bg-[#E58B38]/15',
    text: 'text-[#BA6828]',
    dot: 'bg-[#E58B38]',
  },
  'Very Poor': {
    bg: 'bg-[#D85D43]/15',
    text: 'text-[#BA1A1A]',
    dot: 'bg-[#D85D43]',
  },
  Severe: {
    bg: 'bg-[#BA1A1A]/15',
    text: 'text-[#BA1A1A]',
    dot: 'bg-[#BA1A1A]',
  },
};

export const SeverityChip: React.FC<SeverityChipProps> = ({ category, size = 'sm' }) => {
  const conf = severityConfig[category] || severityConfig['Moderate'];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-semibold ${conf.bg} ${conf.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`}></span>
      <span>{category}</span>
    </span>
  );
};

