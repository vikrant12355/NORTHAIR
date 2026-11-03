/**
 * Build dynamic WHERE clauses for DuckDB queries based on filter parameters
 */
export function buildFilterClauses(params: {
  state?: string;
  city?: string;
  stationId?: string;
  startDate?: string;
  endDate?: string;
  season?: string;
}): { whereClause: string; filterParams: any[] } {
  const conditions: string[] = ['1=1'];
  const filterParams: any[] = [];

  if (params.state && params.state !== 'ALL') {
    conditions.push('"State" = ?');
    filterParams.push(params.state);
  }

  if (params.city && params.city !== 'ALL') {
    conditions.push('"City" = ?');
    filterParams.push(params.city);
  }

  if (params.stationId && params.stationId !== 'ALL') {
    conditions.push('"Station ID" = ?');
    filterParams.push(params.stationId);
  }

  if (params.startDate) {
    conditions.push('"Date" >= ?');
    filterParams.push(params.startDate);
  }

  if (params.endDate) {
    conditions.push('"Date" <= ?');
    filterParams.push(params.endDate);
  }

  return {
    whereClause: conditions.join(' AND '),
    filterParams,
  };
}

