import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const initialForm = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const { user, login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/panel" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password);
      }
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu. E-posta ve şifrenizi tekrar kontrol edin.');
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset() {
    if (!form.email) {
      setError('Şifre sıfırlama için önce e-posta adresinizi girin.');
      return;
    }

    setBusy(true);
    setError('');
    setInfo('');

    try {
      await resetPassword(form.email);
      setInfo('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (err) {
      setError('Şifre sıfırlama bağlantısı gönderilemedi. E-posta adresinizi kontrol edin.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="container auth-layout-v2">
        <div className="auth-promo-panel">
          <div className="section-chip">Yönetim paneli girişi</div>
          <h1>Profilini oluştur, linkini paylaş, buluşmaları tek ekrandan yönet.</h1>
          <p>
            Hasat Zamanı ile kullanıcılara sıcak ama düzenli bir deneyim sun. Önce hesabını oluştur,
            sonra herkese açık profil sayfanı birkaç dakikada yayına al.
          </p>

          <div className="promo-points">
            <div className="promo-point">
              <strong>Şık profil sayfası</strong>
              <span>Emekli olan kişi için paylaşılabilir tek bağlantı</span>
            </div>
            <div className="promo-point">
              <strong>Slot yönetimi</strong>
              <span>Şehir, tarih, saat ve buluşma tipi bazlı yayın</span>
            </div>
            <div className="promo-point">
              <strong>Onay akışı</strong>
              <span>Gelen talepleri panelden kabul et veya reddet</span>
            </div>
          </div>
        </div>

        <div className="auth-card-v2">
          <div className="auth-card-head">
            <div>
              <div className="small-kicker">Hesabın</div>
              <h2>{mode === 'login' ? 'Panele giriş yap' : 'Yeni hesap oluştur'}</h2>
            </div>

            <div className="mode-switch-v2">
              <button
                type="button"
                className={mode === 'login' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('login')}
              >
                Giriş
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('register')}
              >
                Kayıt
              </button>
            </div>
          </div>

          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              E-posta adresi
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ornek@mail.com"
                required
              />
            </label>

            <label>
              Şifre
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="En az 6 karakter"
                minLength={6}
                required
              />
            </label>

            {error ? <div className="notice error">{error}</div> : null}
            {info ? <div className="notice success">{info}</div> : null}

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Lütfen bekleyin...' : mode === 'login' ? 'Giriş yap' : 'Hesap oluştur'}
            </button>
          </form>

          <button type="button" className="inline-text-link" onClick={handlePasswordReset} disabled={busy}>
            Şifremi unuttum
          </button>
        </div>
      </div>
    </section>
  );
}
