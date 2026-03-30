import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Paylaşılabilir kişisel sayfa',
    text: 'Emekli olan kişi kendi linkini LinkedIn veya başka bir mecrada paylaşır. Herkes aynı sade sayfadan erişir.',
  },
  {
    title: 'Şehir ve tarih odaklı uygunluk',
    text: 'Ankara, Berlin ya da İstanbul fark etmez; hangi şehirde ne zaman müsait olduğunuzu ayrı ayrı yayınlarsınız.',
  },
  {
    title: 'Samimi ama kontrollü istek akışı',
    text: 'Ziyaretçi kısa bir not bırakır, ev sahibi panelden talebi kabul eder ya da reddeder.',
  },
];

const steps = [
  'Kayıt olun ve herkese açık profilinizi birkaç dakikada hazırlayın.',
  'Şehir, gün, saat ve buluşma tipi seçerek slotlarınızı yayınlayın.',
  'Bağlantınızı paylaşın; sizi tanıyan kişiler uygun zamanı seçip istek göndersin.',
  'Gelen talepleri tek panelden yönetin ve onayladığınız slotu otomatik kapatın.',
];

export default function HomePage() {
  return (
    <>
      <section className="hero-shell">
        <div className="container hero-grid-v2">
          <div className="hero-copy-block">
            <div className="section-chip">Vefa dolu profesyonel buluşma platformu</div>
            <h1 className="hero-title-v2">
              Yılların emeğini,
              <br /> yeniden kurulacak güzel masalara taşıyın.
            </h1>
            <p className="hero-text-v2">
              Hasat Zamanı; emekli olmuş ya da aktif iş hayatından çekilmiş kişilerin, geçmişte hayatına
              dokundukları insanlarla yeniden bir araya gelmesini kolaylaştırır. Kahve, kahvaltı, öğle yemeği
              veya kısa bir sohbet için şehir ve tarih bazlı uygunluk yayınlayın, istekleri zarif bir akışla yönetin.
            </p>

            <div className="hero-cta-row">
              <Link to="/giris" className="btn btn-primary btn-lg">
                Hemen başla
              </Link>
              <a href="#detay" className="btn btn-secondary btn-lg">
                Nasıl çalışır?
              </a>
            </div>

            <div className="hero-metrics">
              <div className="metric-card">
                <strong>Şehir bazlı</strong>
                <span>Her şehir için ayrı uygunluk</span>
              </div>
              <div className="metric-card">
                <strong>Tek link</strong>
                <span>Paylaşılabilir kişisel profil</span>
              </div>
              <div className="metric-card">
                <strong>Kolay onay</strong>
                <span>Kabul et, reddet, yönet</span>
              </div>
            </div>
          </div>

          <div className="hero-showcase-card">
            <div className="showcase-window">
              <div className="window-header">
                <div className="window-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="window-label">Örnek akış</div>
              </div>

              <div className="journey-stack">
                <article className="journey-step accent-green">
                  <div className="journey-step-title">1. Profil bağlantısı</div>
                  <p>hasatzamani.com/u/ayse-yildirim</p>
                </article>
                <article className="journey-step accent-amber">
                  <div className="journey-step-title">2. Müsaitlik seçimi</div>
                  <p>12 Mayıs · Ankara · 10:30 - 11:30 · Kahve</p>
                </article>
                <article className="journey-step accent-white">
                  <div className="journey-step-title">3. Not bırakma</div>
                  <p>
                    “Birlikte çalıştığımız yılları anmak ve size bir kahve ısmarlamak isterim.”
                  </p>
                </article>
                <article className="journey-step accent-soft">
                  <div className="journey-step-title">4. Panel onayı</div>
                  <p>Talep kabul edilir, slot kapanır ve buluşma akışı netleşir.</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block" id="detay">
        <div className="container">
          <div className="section-head-row">
            <div>
              <div className="section-chip subtle">Neden Hasat Zamanı?</div>
              <h2 className="section-title">Randevu sistemi gibi değil, sıcak ve düzenli bir buluşma deneyimi</h2>
            </div>
            <p className="section-side-copy">
              Burada amaç sadece slot açmak değil; profesyonel hayatta iz bırakmış kişilere yeniden ulaşmayı
              doğal, zarif ve kullanıcı dostu hale getirmek.
            </p>
          </div>

          <div className="feature-grid-v2">
            {highlights.map((item) => (
              <article key={item.title} className="feature-card-v2">
                <div className="feature-badge-dot" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block muted-band">
        <div className="container roadmap-wrap">
          <div className="roadmap-copy">
            <div className="section-chip subtle">Kurulum akışı</div>
            <h2 className="section-title">Dört adımda yayınlayın, paylaşın, buluşmaları yönetin</h2>
            <p>
              İlk sürüm sade olmalı: profil, kişisel link, müsaitlik, istek formu ve panel onayı. Geri kalan her şey
              bunun üstüne inşa edilir.
            </p>
          </div>

          <div className="timeline-stack">
            {steps.map((step, index) => (
              <div key={step} className="timeline-item">
                <div className="timeline-index">0{index + 1}</div>
                <div>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
