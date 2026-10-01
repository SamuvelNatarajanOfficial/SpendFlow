import { Navigate, Route, Routes } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { Dashboard } from './pages/Dashboard';
import { Months } from './pages/Months';
import { Regular } from './pages/Regular';
import { Extra } from './pages/Extra';
import { Presets } from './pages/Presets';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="months" element={<Months />} />
        <Route path="regular" element={<Regular />} />
        <Route path="extra" element={<Extra />} />
        <Route path="presets" element={<Presets />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
