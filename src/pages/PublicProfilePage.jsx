import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createMeetingRequest, getPublicProfile, getPublicSlotsBySlug } from '../lib/firestore';
import { formatDate, formatTimeRange, groupSlotsByCity, sortSlotsByDateAsc } from '../utils/date';

const initialRequest = {
  requesterName: '',
  requesterEmail: '',
  requesterLinkedIn: '',
  requesterCompany: '',
  requesterLocation: '',
  message: '',
};

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.45, delay },
  };
}

export default function PublicProfilePage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [requestForm, setRequestForm] = useState(initialRequest);
  const [busy, setBusy] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadPage() {
      setBusy(true);
      setError('');

      try {
        const [profileData, slotData] = await Promise.all([
          getPublicProfile(slug),
          getPublicSlotsBySlug(slug),
        ]);

        setProfile(profileData);
        setSlots(sortSlotsByDateAsc(slotData));
      } catch (err) {
        setError('Profil bilgileri yüklenemedi.');
      } finally {
        setBusy(false);
      }
    }

    loadPage();
  }, [slug]);

  const groupedSlots = useMemo(() => groupSlotsByCity(slots), [slots]);

  function handleChange(event) {
    const { name, value } = event.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedSlot || !profile) return;

    setSending(true);
    setError('');
    setSuccess('');

    try {
      await createMeetingRequest({
        hostId: profile.ownerId,
        hostSlug: slug,
        slotId: selectedSlot.id,
        slotLabel: `${formatDate(selectedSlot.date)} · ${selectedSlot.city} · ${formatTimeRange(
          selectedSlot.startTime,
          selectedSlot.endTime
        )}`,
        meetingType: selectedSlot.meetingType,
        ...requestForm,
      });

      setSuccess('Buluşma isteğiniz gönderildi. Karşı taraf panelinden değerlendirecek.');
      setRequestForm(initialRequest);
      setSelectedSlot(null);
    } catch (err) {
      setError('İstek gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  }

  if (busy) {
    return <div className="hz-page-center">Profil yükleniyor...</div>;
  }

  if (!profile) {
    return (
      <div className="hz-container hz-narrow-wrap hz-state-wrap">
        <div className="hz-state-card">
          <h1>Profil bulunamadı</h1>
          <p>Bağlantı yanlış olabilir ya da profil yayından kaldırılmış olabilir.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="hz-public-page">
      <div className="hz-container hz-public-grid">
        <motion.aside {...fadeUp(0)} className="hz-profile-card">
          <div className="hz-chip hz-chip-soft">Hasat Zamanı profili</div>
          <div className="hz-profile-avatar">{profile.displayName?.slice(0, 1) || 'H'}</div>
          <h1>{profile.displayName}</h1>
          <div className="hz-public-role">{profile.title}</div>
          <p className="hz-public-about">{profile.about}</p>

          <div className="hz-profile-facts">
            <div className="hz-fact-card">
              <span>Şu an bulunduğu şehir</span>
              <strong>{profile.currentCity || 'Belirtilmedi'}</strong>
            </div>

            <div className="hz-fact-card">
              <span>Karşılama notu</span>
              <strong>
                {profile.welcomeMessage || 'Eski günleri konuşmak için uygun bir zaman seçebilirsiniz.'}
              </strong>
            </div>
          </div>

          {profile.linkedinUrl ? (
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="hz-btn hz-btn-secondary hz-btn-block">
              LinkedIn profiline git
            </a>
          ) : null}
        </motion.aside>

        <div className="hz-booking-area">
          <motion.section {...fadeUp(0.05)} className="hz-panel-card">
            <div className="hz-panel-head">
              <div>
                <div className="hz-eyebrow">Müsait zamanlar</div>
                <h2>Bir tarih ve saat seçin</h2>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  className="hz-notice hz-notice-success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {success}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  className="hz-notice hz-notice-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {slots.length === 0 ? (
              <div className="hz-empty-box">
                Şu an yayınlanmış uygunluk bulunmuyor. Daha sonra tekrar bakabilirsiniz.
              </div>
            ) : (
              <div className="hz-city-groups">
                {Object.entries(groupedSlots).map(([city, citySlots]) => (
                  <div key={city} className="hz-city-block">
                    <div className="hz-list-head">
                      <h3>{city}</h3>
                      <span>{citySlots.length} slot</span>
                    </div>

                    <div className="hz-slot-grid">
                      {citySlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          className={selectedSlot?.id === slot.id ? 'hz-public-slot active' : 'hz-public-slot'}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <strong>{formatDate(slot.date)}</strong>
                          <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
                          <small>{slot.meetingType}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

          <motion.section {...fadeUp(0.1)} className="hz-panel-card">
            <div className="hz-panel-head">
              <div>
                <div className="hz-eyebrow">Buluşma isteği</div>
                <h2>
                  {selectedSlot
                    ? `${selectedSlot.city} · ${formatDate(selectedSlot.date)} için notunu bırak`
                    : 'Önce bir buluşma slotu seçin'}
                </h2>
              </div>
            </div>

            <form className="hz-form-grid hz-form-grid-2" onSubmit={handleSubmit}>
              <label>
                Ad Soyad
                <input
                  type="text"
                  name="requesterName"
                  value={requestForm.requesterName}
                  onChange={handleChange}
                  placeholder="Adınız Soyadınız"
                  required
                />
              </label>

              <label>
                E-posta
                <input
                  type="email"
                  name="requesterEmail"
                  value={requestForm.requesterEmail}
                  onChange={handleChange}
                  placeholder="ornek@mail.com"
                  required
                />
              </label>

              <label>
                LinkedIn bağlantınız
                <input
                  type="url"
                  name="requesterLinkedIn"
                  value={requestForm.requesterLinkedIn}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </label>

              <label>
                Şirket / kurum
                <input
                  type="text"
                  name="requesterCompany"
                  value={requestForm.requesterCompany}
                  onChange={handleChange}
                  placeholder="Çalıştığınız kurum"
                />
              </label>

              <label className="hz-col-span-2">
                Bulunduğunuz şehir
                <input
                  type="text"
                  name="requesterLocation"
                  value={requestForm.requesterLocation}
                  onChange={handleChange}
                  placeholder="Örn. Berlin"
                />
              </label>

              <label className="hz-col-span-2">
                Kısa notunuz
                <textarea
                  name="message"
                  value={requestForm.message}
                  onChange={handleChange}
                  placeholder="Sizi nereden tanıdığınızı ve neden görüşmek istediğinizi yazabilirsiniz."
                  rows="6"
                  required
                />
              </label>

              <button type="submit" className="hz-btn hz-btn-primary hz-btn-block hz-col-span-2" disabled={!selectedSlot || sending}>
                {sending ? 'Gönderiliyor...' : 'Buluşma isteğini gönder'}
              </button>
            </form>
          </motion.section>
        </div>
      </div>
    </section>
  );
}