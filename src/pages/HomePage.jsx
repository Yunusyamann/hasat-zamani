import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const highlights = [
  {
    title: 'Kişisel buluşma sayfası',
    text: 'Tek bir bağlantıyla sizi tanıyan insanlara sade, güven veren ve modern bir görünüm sunun.',
  },
  {
    title: 'Şehir ve zaman odaklı uygunluk',
    text: 'Hangi şehirde, hangi tarihte, hangi saatler arasında müsait olduğunuzu kolayca yayınlayın.',
  },
  {
    title: 'Samimi istek akışı',
    text: 'İnsanlar kısa bir notla size ulaşsın, siz de talepleri tek panelden değerlendirin.',
  },
];

const steps = [
  'Profilinizi birkaç dakikada hazırlayın ve paylaşılabilir bağlantınızı oluşturun.',
  'Şehir, tarih, saat ve buluşma tipine göre uygunluk slotları ekleyin.',
  'Bağlantınızı paylaşın; sizi tanıyan kişiler uygun zamanı seçip not bıraksın.',
  'Talepleri panelden yönetin ve onayladığınız buluşmayı netleştirin.',
];

const floatingCards = [
  'İstanbul · 14 Mayıs · Kahve',
  'Berlin · 22 Mayıs · Öğle yemeği',
  'Ankara · 03 Haziran · Kısa sohbet',
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.55, delay },
  };
}

export default function HomePage() {
  return (
    <>
      <section className="hz-hero">
        <div className="hz-container hz-hero-grid">
          <motion.div {...fadeUp(0)} className="hz-hero-copy">
            <div className="hz-chip">Vefa dolu profesyonel buluşma platformu</div>

            <h1>
              Yılların emeğini,
              <span> yeniden kurulacak güzel masalara taşıyın.</span>
            </h1>

            <p>
              Hasat Zamanı; emekli olmuş veya aktif iş hayatından çekilmiş kişilerin,
              geçmişte hayatına dokundukları insanlarla yeniden bir araya gelmesini kolaylaştırır.
              Sıcak, sakin ve güven veren bir deneyimle buluşmalarınızı planlayın.
            </p>

            <div className="hz-hero-actions">
              <Link to="/giris" className="hz-btn hz-btn-primary hz-btn-lg">
                Hemen başla
              </Link>
              <a href="#nasil-calisir" className="hz-btn hz-btn-secondary hz-btn-lg">
                Nasıl çalışır?
              </a>
            </div>

            <div className="hz-hero-stats">
              <div className="hz-stat-card">
                <strong>Tek link</strong>
                <span>Paylaşılabilir kişisel profil</span>
              </div>
              <div className="hz-stat-card">
                <strong>Şehir bazlı</strong>
                <span>Esnek müsaitlik yönetimi</span>
              </div>
              <div className="hz-stat-card">
                <strong>Kolay onay</strong>
                <span>Basit ve kontrollü akış</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hz-hero-visual"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="hz-glow hz-glow-1" />
            <div className="hz-glow hz-glow-2" />

            <div className="hz-showcase-card">
              <div className="hz-showcase-top">
                <div className="hz-window-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="hz-window-label">Örnek profil akışı</div>
              </div>

              <div className="hz-profile-preview">
                <div className="hz-avatar-ring">AY</div>
                <div>
                  <strong>Ayşe Yıldırım</strong>
                  <p>Eski Genel Müdür · Mentor</p>
                </div>
              </div>

              <div className="hz-preview-note">
                “Birlikte çalıştığımız yılları anmak ve size kahve ısmarlamak isterim.”
              </div>

              <div className="hz-preview-list">
                {floatingCards.map((item, index) => (
                  <motion.div
                    key={item}
                    className="hz-preview-pill"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.12, duration: 0.45 }}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="hz-section" id="nasil-calisir">
        <div className="hz-container">
          <motion.div {...fadeUp(0)} className="hz-section-head">
            <div>
              <div className="hz-chip hz-chip-soft">Neden Hasat Zamanı?</div>
              <h2>Sıradan bir randevu ekranı değil, zarif bir yeniden buluşma deneyimi</h2>
            </div>

            <p>
              Amaç sadece slot yayınlamak değil; geçmişte iz bırakmış insanlara yeniden ulaşmayı
              kolay, estetik ve güven veren bir hale getirmek.
            </p>
          </motion.div>

          <div className="hz-feature-grid">
            {highlights.map((item, index) => (
              <motion.article key={item.title} {...fadeUp(index * 0.08)} className="hz-feature-card">
                <div className="hz-feature-icon" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="hz-section hz-section-soft">
        <div className="hz-container hz-roadmap-grid">
          <motion.div {...fadeUp(0)}>
            <div className="hz-chip hz-chip-soft">Kurulum akışı</div>
            <h2>Basit başla, temiz ilerle, kolay yönet</h2>
            <p className="hz-muted-copy">
              Ürünün merkezinde profil, paylaşılabilir bağlantı, uygunluk ve buluşma isteği akışı yer alır.
              Her şey bu omurganın üzerine kurulur.
            </p>
          </motion.div>

          <div className="hz-timeline">
            {steps.map((step, index) => (
              <motion.div key={step} {...fadeUp(index * 0.08)} className="hz-timeline-item">
                <div className="hz-timeline-index">0{index + 1}</div>
                <div>{step}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}