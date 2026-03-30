import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PublicProfilePage from './pages/PublicProfilePage';

function NotFoundPage() {
  return (
    <div className="container section narrow">
      <div className="card soft-card center-card">
        <h1>Sayfa bulunamadı</h1>
        <p>Aradığınız içerik taşınmış olabilir veya bağlantı hatalı olabilir.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/giris" element={<LoginPage />} />
        <Route path="/u/:slug" element={<PublicProfilePage />} />
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
