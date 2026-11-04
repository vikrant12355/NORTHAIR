import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

// Pages
import { OverviewPage } from './pages/overview/OverviewPage';
import { RegionalPage } from './pages/regional/RegionalPage';
import { HotspotsPage } from './pages/hotspots/HotspotsPage';
import { PollutantsPage } from './pages/pollutants/PollutantsPage';
import { RelationshipsPage } from './pages/pollutants/RelationshipsPage';
import { WeatherPage } from './pages/weather/WeatherPage';
import { HistoricalPage } from './pages/historical/HistoricalPage';
import { PredictivePage } from './pages/predictive/PredictivePage';
import { InsightsPage } from './pages/insights/InsightsPage';
import { StationsPage } from './pages/stations/StationsPage';
import { StationDetailPage } from './pages/stations/StationDetailPage';
import { SeasonalPage } from './pages/seasonal/SeasonalPage';
import { DiurnalPage } from './pages/diurnal/DiurnalPage';
import { ComparisonPage } from './pages/comparison/ComparisonPage';
import { QualityPage } from './pages/quality/QualityPage';
import { CompliancePage } from './pages/compliance/CompliancePage';
import { ExplorerPage } from './pages/explorer/ExplorerPage';
import { MethodologyPage } from './pages/methodology/MethodologyPage';
import { MapPage } from './pages/map/MapPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
    
      <Layout>
        <Routes>
          {/* Intelligence Matrix */}
          <Route path="/" element={<OverviewPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/regional" element={<RegionalPage />} />
          <Route path="/hotspots" element={<HotspotsPage />} />
          <Route path="/pollutants" element={<PollutantsPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/historical" element={<HistoricalPage />} />
          <Route path="/predictive" element={<PredictivePage />} />
          <Route path="/insights" element={<InsightsPage />} />

          {/* Advanced Analytics */}
          <Route path="/stations" element={<StationsPage />} />
          <Route path="/stations/:id" element={<StationDetailPage />} />
          <Route path="/seasonal" element={<SeasonalPage />} />
          <Route path="/diurnal" element={<DiurnalPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/pollutant-relationships" element={<RelationshipsPage />} />
          <Route path="/relationships" element={<RelationshipsPage />} />

          {/* Data & Trust */}
          <Route path="/quality" element={<QualityPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;

