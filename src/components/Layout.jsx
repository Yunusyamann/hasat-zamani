import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

function navClass({ isActive }) {
  return isActive ? 'hz-nav-link active' : 'hz-nav-link';
}

export default function Layout({ children }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="hz-app-shell">
      <header className="hz-header">
        <div className="hz-container hz-header-inner">
          <Link to="/" className="hz-brand">
            <motion.div
              className="hz-brand-mark"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45 }}
            >
              H
            </motion.div>

            <div>
              <div className="hz-brand-title">Hasat Zamanı</div>
              <div className="hz-brand-subtitle">
                Geçmişten gelen bağları yeniden buluşturur
              </div>
            </div>
          </Link>

          <nav className="hz-nav">
            <NavLink to="/" className={navClass}>
              Ana sayfa
            </NavLink>

            {user ? (
              <>
                <NavLink to="/panel" className={navClass}>
                  Panelim
                </NavLink>

                {profile?.slug ? (
                  <Link to={`/u/${profile.slug}`} className="hz-btn hz-btn-secondary hz-btn-sm">
                    Profilimi gör
                  </Link>
                ) : null}

                <button type="button" className="hz-btn hz-btn-primary hz-btn-sm" onClick={handleLogout}>
                  Çıkış yap
                </button>
              </>
            ) : (
              <Link to="/giris" className="hz-btn hz-btn-primary hz-btn-sm">
                Giriş / Kayıt
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="hz-main">{children}</main>

      <footer className="hz-footer">
        <div className="hz-container hz-footer-inner">
          <div>
            <div className="hz-footer-title">Hasat Zamanı</div>
            <p>
              Yıllar boyunca kurulmuş bağları sıcak, zarif ve sade bir dijital deneyimle
              yeniden aynı sofrada buluşturur.
            </p>
          </div>
          <p>© 2026 Hasat Zamanı</p>
        </div>
      </footer>
    </div>
  );
}