import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  acceptRequest,
  createSlot,
  getRequestsByHost,
  getSlotsByHost,
  rejectRequest,
  removeSlot,
  saveProfile,
} from '../lib/firestore';
import { formatDate, formatTimeRange, sortByCreatedAtDesc, sortSlotsByDateAsc } from '../utils/date';

const initialProfile = {
  displayName: '',
  title: '',
  about: '',
  currentCity: '',
  linkedinUrl: '',
  welcomeMessage: '',
  slug: '',
};

const initialSlot = {
  city: '',
  date: '',
  startTime: '',
  endTime: '',
  meetingType: 'Kahve',
};

const statusLabels = {
  pending: 'Bekliyor',
  accepted: 'Kabul edildi',
  rejected: 'Reddedildi',
};

function cardMotion(delay = 0) {
  return {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.45, delay },
  };
}

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [profileForm, setProfileForm] = useState(initialProfile);
  const [slotForm, setSlotForm] = useState(initialSlot);
  const [slots, setSlots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        title: profile.title || '',
        about: profile.about || '',
        currentCity: profile.currentCity || '',
        linkedinUrl: profile.linkedinUrl || '',
        welcomeMessage: profile.welcomeMessage || '',
        slug: profile.slug || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      setLoadingData(true);

      try {
        const [slotData, requestData] = await Promise.all([
          getSlotsByHost(user.uid),
          getRequestsByHost(user.uid),
        ]);

        setSlots(sortSlotsByDateAsc(slotData));
        setRequests(sortByCreatedAtDesc(requestData));
      } finally {
        setLoadingData(false);
      }
    }

    loadDashboard();
  }, [user]);

  const publicLink = useMemo(() => {
    if (!profileForm.slug) return '';
    return `${window.location.origin}/u/${profileForm.slug}`;
  }, [profileForm.slug]);

  const pendingCount = requests.filter((request) => request.status === 'pending').length;
  const acceptedCount = requests.filter((request) => request.status === 'accepted').length;

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSlotChange(event) {
    const { name, value } = event.target;
    setSlotForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    setSavingProfile(true);
    setFeedback('');
    setError('');

    try {
      const newSlug = await saveProfile(user.uid, user.email, profileForm, profile?.slug || '');
      setProfileForm((prev) => ({ ...prev, slug: newSlug }));
      await refreshProfile();
      setFeedback('Profil kaydedildi. Paylaşılabilir bağlantın güncellendi.');
    } catch (err) {
      setError(err.message || 'Profil kaydedilirken bir hata oluştu.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleCreateSlot(event) {
    event.preventDefault();

    if (!profileForm.slug) {
      setError('Önce profilini ve bağlantı adını kaydetmelisin.');
      return;
    }

    setSavingSlot(true);
    setFeedback('');
    setError('');

    try {
      await createSlot({
        hostId: user.uid,
        hostSlug: profileForm.slug,
        city: slotForm.city,
        date: slotForm.date,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        meetingType: slotForm.meetingType,
      });

      const updatedSlots = await getSlotsByHost(user.uid);
      setSlots(sortSlotsByDateAsc(updatedSlots));
      setSlotForm(initialSlot);
      setFeedback('Yeni uygunluk slotu eklendi.');
    } catch (err) {
      setError('Müsaitlik eklenirken bir hata oluştu.');
    } finally {
      setSavingSlot(false);
    }
  }

  async function handleDeleteSlot(slotId) {
    setError('');
    setFeedback('');

    try {
      await removeSlot(slotId);
      setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
      setFeedback('Slot kaldırıldı.');
    } catch (err) {
      setError('Slot silinemedi.');
    }
  }

  async function handleAccept(requestId, slotId) {
    setError('');
    setFeedback('');

    try {
      await acceptRequest(requestId, slotId, 'Talebiniz kabul edildi. Buluşma için teşekkürler.');
      const [slotData, requestData] = await Promise.all([
        getSlotsByHost(user.uid),
        getRequestsByHost(user.uid),
      ]);
      setSlots(sortSlotsByDateAsc(slotData));
      setRequests(sortByCreatedAtDesc(requestData));
      setFeedback('Talep kabul edildi ve ilgili slot kapatıldı.');
    } catch (err) {
      setError('Talep kabul edilirken bir hata oluştu.');
    }
  }

  async function handleReject(requestId) {
    setError('');
    setFeedback('');

    try {
      await rejectRequest(requestId, 'Bu zaman dilimi için uygunluk sağlanamadı.');
      const requestData = await getRequestsByHost(user.uid);
      setRequests(sortByCreatedAtDesc(requestData));
      setFeedback('Talep reddedildi.');
    } catch (err) {
      setError('Talep reddedilirken bir hata oluştu.');
    }
  }

  return (
    <section className="hz-dashboard-page">
      <div className="hz-container">
        <motion.div {...cardMotion(0)} className="hz-dashboard-hero">
          <div>
            <div className="hz-chip hz-chip-soft">Yönetim paneli</div>
            <h1>Profilini düzenle, uygunluk yayınla, gelen buluşma isteklerini yönet.</h1>
            <p>
              Her şeyi tek yerde topladık. Önce profilini kaydet, sonra şehir ve saat bazlı
              slotlarını yayınla. Talepler geldiğinde birkaç tıkla yanıt ver.
            </p>
          </div>

          <div className="hz-dashboard-stats">
            <div className="hz-dashboard-stat-card">
              <span>Yayındaki slot</span>
              <strong>{slots.length}</strong>
            </div>
            <div className="hz-dashboard-stat-card">
              <span>Bekleyen talep</span>
              <strong>{pendingCount}</strong>
            </div>
            <div className="hz-dashboard-stat-card">
              <span>Kabul edilen</span>
              <strong>{acceptedCount}</strong>
            </div>
          </div>
        </motion.div>

        <motion.div {...cardMotion(0.05)} className="hz-share-banner">
          <div>
            <div className="hz-eyebrow">Paylaşım bağlantın</div>
            <div className="hz-share-link">{publicLink || 'Önce profil bağlantını kaydet'}</div>
          </div>

          <button
            type="button"
            className="hz-btn hz-btn-secondary"
            onClick={() => publicLink && navigator.clipboard.writeText(publicLink)}
            disabled={!publicLink}
          >
            Linki kopyala
          </button>
        </motion.div>

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

        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div
              key="feedback"
              className="hz-notice hz-notice-success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {feedback}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="hz-dashboard-grid">
          <motion.section {...cardMotion(0.08)} className="hz-panel-card">
            <div className="hz-panel-head">
              <div>
                <div className="hz-eyebrow">Profil ayarları</div>
                <h2>Herkese açık sayfanı düzenle</h2>
              </div>
            </div>

            <form className="hz-form-grid hz-form-grid-2" onSubmit={handleProfileSave}>
              <label>
                Görünecek isim
                <input
                  type="text"
                  name="displayName"
                  value={profileForm.displayName}
                  onChange={handleProfileChange}
                  placeholder="Örn. Ayşe Yıldırım"
                  required
                />
              </label>

              <label>
                Ünvan / kısa tanım
                <input
                  type="text"
                  name="title"
                  value={profileForm.title}
                  onChange={handleProfileChange}
                  placeholder="Mentor, yönetici, akademisyen..."
                  required
                />
              </label>

              <label>
                Profil bağlantısı
                <input
                  type="text"
                  name="slug"
                  value={profileForm.slug}
                  onChange={handleProfileChange}
                  placeholder="ayse-yildirim"
                  required
                />
              </label>

              <label>
                Şu an bulunduğun şehir
                <input
                  type="text"
                  name="currentCity"
                  value={profileForm.currentCity}
                  onChange={handleProfileChange}
                  placeholder="Ankara"
                />
              </label>

              <label className="hz-col-span-2">
                Kısa biyografi
                <textarea
                  name="about"
                  value={profileForm.about}
                  onChange={handleProfileChange}
                  placeholder="Kariyer yolculuğunuzu ve neden bu buluşmalara açık olduğunuzu kısaca anlatın."
                  rows="6"
                  required
                />
              </label>

              <label>
                LinkedIn bağlantısı
                <input
                  type="url"
                  name="linkedinUrl"
                  value={profileForm.linkedinUrl}
                  onChange={handleProfileChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </label>

              <label>
                Karşılama mesajı
                <input
                  type="text"
                  name="welcomeMessage"
                  value={profileForm.welcomeMessage}
                  onChange={handleProfileChange}
                  placeholder="Sizinle yeniden görüşmekten mutluluk duyarım."
                />
              </label>

              <button type="submit" className="hz-btn hz-btn-primary hz-btn-block hz-col-span-2" disabled={savingProfile}>
                {savingProfile ? 'Kaydediliyor...' : 'Profili kaydet'}
              </button>
            </form>
          </motion.section>

          <motion.section {...cardMotion(0.12)} className="hz-panel-card">
            <div className="hz-panel-head">
              <div>
                <div className="hz-eyebrow">Müsaitlik</div>
                <h2>Yeni slot ekle</h2>
              </div>
            </div>

            <form className="hz-form-grid" onSubmit={handleCreateSlot}>
              <label>
                Şehir
                <input
                  type="text"
                  name="city"
                  value={slotForm.city}
                  onChange={handleSlotChange}
                  placeholder="Berlin"
                  required
                />
              </label>

              <label>
                Tarih
                <input type="date" name="date" value={slotForm.date} onChange={handleSlotChange} required />
              </label>

              <label>
                Başlangıç saati
                <input type="time" name="startTime" value={slotForm.startTime} onChange={handleSlotChange} required />
              </label>

              <label>
                Bitiş saati
                <input type="time" name="endTime" value={slotForm.endTime} onChange={handleSlotChange} required />
              </label>

              <label>
                Buluşma tipi
                <select name="meetingType" value={slotForm.meetingType} onChange={handleSlotChange}>
                  <option>Kahve</option>
                  <option>Kahvaltı</option>
                  <option>Öğle yemeği</option>
                  <option>Akşam yemeği</option>
                  <option>Online görüşme</option>
                </select>
              </label>

              <button type="submit" className="hz-btn hz-btn-primary hz-btn-block" disabled={savingSlot}>
                {savingSlot ? 'Ekleniyor...' : 'Slot ekle'}
              </button>
            </form>

            <div className="hz-divider" />

            <div className="hz-list-head">
              <h3>Yayınlanan slotlar</h3>
              <span>{slots.length} adet</span>
            </div>

            {loadingData ? (
              <div className="hz-empty-box">Veriler yükleniyor...</div>
            ) : slots.length === 0 ? (
              <div className="hz-empty-box">Henüz yayınlanmış bir müsaitlik yok.</div>
            ) : (
              <div className="hz-stack-list">
                {slots.map((slot) => (
                  <article key={slot.id} className="hz-slot-item">
                    <div>
                      <strong>{slot.city}</strong>
                      <p>
                        {formatDate(slot.date)} · {formatTimeRange(slot.startTime, slot.endTime)}
                      </p>
                      <span>{slot.meetingType}</span>
                    </div>

                    <button type="button" className="hz-inline-link hz-inline-danger" onClick={() => handleDeleteSlot(slot.id)}>
                      Kaldır
                    </button>
                  </article>
                ))}
              </div>
            )}
          </motion.section>
        </div>

        <motion.section {...cardMotion(0.16)} className="hz-panel-card hz-request-section">
          <div className="hz-panel-head">
            <div>
              <div className="hz-eyebrow">Gelen talepler</div>
              <h2>Buluşma isteklerini buradan yönet</h2>
            </div>
          </div>

          {loadingData ? (
            <div className="hz-empty-box">Talepler yükleniyor...</div>
          ) : requests.length === 0 ? (
            <div className="hz-empty-box">Henüz gelen bir buluşma isteği yok.</div>
          ) : (
            <div className="hz-request-grid">
              {requests.map((request) => (
                <article key={request.id} className="hz-request-card">
                  <div className="hz-request-top">
                    <div>
                      <h3>{request.requesterName}</h3>
                      <p>{request.slotLabel}</p>
                    </div>
                    <span className={`hz-status-pill ${request.status}`}>
                      {statusLabels[request.status] || request.status}
                    </span>
                  </div>

                  <div className="hz-request-meta">
                    <span>{request.requesterEmail}</span>
                    {request.requesterCompany ? <span>{request.requesterCompany}</span> : null}
                    {request.requesterLocation ? <span>{request.requesterLocation}</span> : null}
                  </div>

                  <p className="hz-request-message">{request.message}</p>

                  {request.requesterLinkedIn ? (
                    <a href={request.requesterLinkedIn} target="_blank" rel="noreferrer" className="hz-inline-link">
                      LinkedIn profilini aç
                    </a>
                  ) : null}

                  {request.status === 'pending' ? (
                    <div className="hz-card-actions">
                      <button type="button" className="hz-btn hz-btn-primary" onClick={() => handleAccept(request.id, request.slotId)}>
                        Kabul et
                      </button>
                      <button type="button" className="hz-btn hz-btn-secondary" onClick={() => handleReject(request.id)}>
                        Reddet
                      </button>
                    </div>
                  ) : request.responseMessage ? (
                    <div className="hz-response-box">Yanıt notu: {request.responseMessage}</div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </section>
  );
}