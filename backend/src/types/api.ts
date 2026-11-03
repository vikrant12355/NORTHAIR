export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta: {
    count?: number;
    generatedAt: string;
    source: string;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface FilterParams {
  state?: string;
  city?: string;
  stationId?: string;
  startDate?: string;
  endDate?: string;
  pollutant?: string;
  resolution?: '1h' | '8h' | '24h' | 'daily' | 'monthly';
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

