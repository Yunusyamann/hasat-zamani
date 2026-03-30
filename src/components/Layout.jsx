import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function navClass({ isActive }) {
  return isActive ? 'top-nav-link active' : 'top-nav-link';
}

export default function Layout({ children }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand-wrap">
            <div className="brand-icon">H</div>
            <div>
              <div className="brand-title">Hasat Zamanı</div>
              <div className="brand-subtitle">Emeklilik sonrası sıcak buluşmalar</div>
            </div>
          </Link>

          <nav className="top-nav">
            <NavLink to="/" className={navClass}>
              Ana sayfa
            </NavLink>

            {user ? (
              <>
                <NavLink to="/panel" className={navClass}>
                  Panelim
                </NavLink>
                {profile?.slug ? (
                  <Link to={`/u/${profile.slug}`} className="btn btn-secondary btn-sm">
                    Profilimi gör
                  </Link>
                ) : null}
                <button type="button" className="btn btn-primary btn-sm" onClick={handleLogout}>
                  Çıkış yap
                </button>
              </>
            ) : (
              <Link to="/giris" className="btn btn-primary btn-sm">
                Giriş / Kayıt
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-title">Hasat Zamanı</div>
            <p>
              Yıllar boyunca kurulmuş bağları, sade bir dijital deneyimle yeniden bir masanın etrafında buluşturur.
            </p>
          </div>
          <p>© 2026 Hasat Zamanı</p>
        </div>
      </footer>
    </div>
  );
}
