import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
        setInfo('Hesabınız oluşturuldu. Şimdi panelinize geçebilirsiniz.');
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
    <section className="hz-auth-page">
      <div className="hz-container hz-auth-grid">
        <motion.div
          className="hz-auth-side"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hz-chip">Yönetim paneli girişi</div>
          <h1>Profilini hazırla, bağlantını paylaş, buluşmaları şık bir akışla yönet.</h1>
          <p>
            Hasat Zamanı ile kullanıcılarına sıcak ama düzenli bir deneyim sun.
            Hesabını oluştur, herkese açık sayfanı yayınla ve gelen istekleri tek yerden takip et.
          </p>

          <div className="hz-auth-points">
            <div className="hz-auth-point">
              <strong>Paylaşılabilir profil</strong>
              <span>Tek link ile sade ve güven veren profil</span>
            </div>
            <div className="hz-auth-point">
              <strong>Müsaitlik yönetimi</strong>
              <span>Şehir, tarih, saat ve buluşma tipi bazlı yayın</span>
            </div>
            <div className="hz-auth-point">
              <strong>Kolay kontrol</strong>
              <span>Gelen istekleri kabul et, reddet, düzenle</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hz-auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="hz-auth-head">
            <div>
              <div className="hz-eyebrow">Hesabın</div>
              <h2>{mode === 'login' ? 'Panele giriş yap' : 'Yeni hesap oluştur'}</h2>
            </div>

            <div className="hz-mode-switch">
              <button
                type="button"
                className={mode === 'login' ? 'hz-mode-btn active' : 'hz-mode-btn'}
                onClick={() => setMode('login')}
              >
                Giriş
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'hz-mode-btn active' : 'hz-mode-btn'}
                onClick={() => setMode('register')}
              >
                Kayıt
              </button>
            </div>
          </div>

          <form className="hz-form-stack" onSubmit={handleSubmit}>
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

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  className="hz-notice hz-notice-error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {error}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {info ? (
                <motion.div
                  key="info"
                  className="hz-notice hz-notice-success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {info}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button type="submit" className="hz-btn hz-btn-primary hz-btn-block" disabled={busy}>
              {busy ? 'Lütfen bekleyin...' : mode === 'login' ? 'Giriş yap' : 'Hesap oluştur'}
            </button>
          </form>

          <button type="button" className="hz-inline-link" onClick={handlePasswordReset} disabled={busy}>
            Şifremi unuttum
          </button>
        </motion.div>
      </div>
    </section>
  );
}