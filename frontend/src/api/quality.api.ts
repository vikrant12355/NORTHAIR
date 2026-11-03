import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { QualitySummary, MissingnessItem, StationCoverageItem } from '../types';

export const qualityApi = {
  getSummary: () => apiClient<QualitySummary>(ENDPOINTS.QUALITY_SUMMARY),
  getMissingness: () => apiClient<MissingnessItem[]>(ENDPOINTS.QUALITY_MISSINGNESS),
  getCoverage: () => apiClient<StationCoverageItem[]>(ENDPOINTS.QUALITY_COVERAGE),
  getIdentities: () => apiClient<any[]>(ENDPOINTS.QUALITY_IDENTITIES),
};

export const systemApi = {
  getHealth: () => apiClient<any>(ENDPOINTS.HEALTH),
  getMeta: () => apiClient<any>(ENDPOINTS.META),
  getFilters: () => apiClient<any>(ENDPOINTS.FILTERS),
  getFindings: () => apiClient<any[]>(ENDPOINTS.FINDINGS),
  getMethodology: () => apiClient<any>(ENDPOINTS.METHODOLOGY),
};

