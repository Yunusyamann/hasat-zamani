import { useEffect, useMemo, useState } from 'react';
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
    <section className="dashboard-shell-v2">
      <div className="container">
        <div className="dashboard-topbar-v2">
          <div>
            <div className="section-chip subtle">Yönetim paneli</div>
            <h1 className="dashboard-title-v2">Profilini düzenle, uygunluk yayınla, talepleri yönet.</h1>
            <p className="dashboard-lead-v2">
              Panelini sade tuttuk: önce profilini kaydet, sonra şehir ve saat bazlı slotlarını yayınla.
              Gelen talepleri de aşağıdaki listeden tek tıkla yönet.
            </p>
          </div>

          <div className="stats-cluster">
            <div className="stat-tile">
              <span>Yayındaki slot</span>
              <strong>{slots.length}</strong>
            </div>
            <div className="stat-tile">
              <span>Bekleyen talep</span>
              <strong>{pendingCount}</strong>
            </div>
            <div className="share-panel-v2">
              <div className="share-caption">Paylaşım bağlantın</div>
              <div className="share-link-box">{publicLink || 'Önce profil bağlantını kaydet'}</div>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => publicLink && navigator.clipboard.writeText(publicLink)}
                disabled={!publicLink}
              >
                Linki kopyala
              </button>
            </div>
          </div>
        </div>

        {error ? <div className="notice error">{error}</div> : null}
        {feedback ? <div className="notice success">{feedback}</div> : null}

        <div className="dashboard-grid-v2">
          <section className="panel-card panel-card-large">
            <div className="panel-head">
              <div>
                <div className="small-kicker">Profil ayarları</div>
                <h2>Herkese açık sayfanı düzenle</h2>
              </div>
            </div>

            <form className="grid-form-v2 two-columns" onSubmit={handleProfileSave}>
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

              <label className="col-span-2">
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

              <button type="submit" className="btn btn-primary btn-block col-span-2" disabled={savingProfile}>
                {savingProfile ? 'Kaydediliyor...' : 'Profili kaydet'}
              </button>
            </form>
          </section>

          <section className="panel-card">
            <div className="panel-head">
              <div>
                <div className="small-kicker">Müsaitlik</div>
                <h2>Yeni slot ekle</h2>
              </div>
            </div>

            <form className="grid-form-v2" onSubmit={handleCreateSlot}>
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

              <button type="submit" className="btn btn-primary btn-block" disabled={savingSlot}>
                {savingSlot ? 'Ekleniyor...' : 'Slot ekle'}
              </button>
            </form>

            <div className="slot-list-panel">
              <div className="slot-list-head">
                <h3>Yayınlanan slotlar</h3>
                <span>{slots.length} adet</span>
              </div>

              {loadingData ? (
                <div className="empty-box">Veriler yükleniyor...</div>
              ) : slots.length === 0 ? (
                <div className="empty-box">Henüz yayınlanmış bir müsaitlik yok.</div>
              ) : (
                <div className="stack-list">
                  {slots.map((slot) => (
                    <article key={slot.id} className="slot-row-card">
                      <div>
                        <strong>{slot.city}</strong>
                        <p>
                          {formatDate(slot.date)} · {formatTimeRange(slot.startTime, slot.endTime)}
                        </p>
                        <span>{slot.meetingType}</span>
                      </div>
                      <button type="button" className="inline-text-link danger" onClick={() => handleDeleteSlot(slot.id)}>
                        Kaldır
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="panel-card request-panel-v2">
          <div className="panel-head split">
            <div>
              <div className="small-kicker">Gelen talepler</div>
              <h2>Buluşma isteklerini buradan yönet</h2>
            </div>
          </div>

          {loadingData ? (
            <div className="empty-box">Talepler yükleniyor...</div>
          ) : requests.length === 0 ? (
            <div className="empty-box">Henüz gelen bir buluşma isteği yok.</div>
          ) : (
            <div className="request-grid-v2">
              {requests.map((request) => (
                <article key={request.id} className="request-card-v2">
                  <div className="request-topline">
                    <div>
                      <h3>{request.requesterName}</h3>
                      <p>{request.slotLabel}</p>
                    </div>
                    <span className={`status-pill ${request.status}`}>{statusLabels[request.status] || request.status}</span>
                  </div>

                  <div className="request-meta-list">
                    <span>{request.requesterEmail}</span>
                    {request.requesterCompany ? <span>{request.requesterCompany}</span> : null}
                    {request.requesterLocation ? <span>{request.requesterLocation}</span> : null}
                  </div>

                  <p className="request-message">{request.message}</p>

                  {request.requesterLinkedIn ? (
                    <a href={request.requesterLinkedIn} target="_blank" rel="noreferrer" className="inline-link-accent">
                      LinkedIn profilini aç
                    </a>
                  ) : null}

                  {request.status === 'pending' ? (
                    <div className="card-actions-row">
                      <button type="button" className="btn btn-primary" onClick={() => handleAccept(request.id, request.slotId)}>
                        Kabul et
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => handleReject(request.id)}>
                        Reddet
                      </button>
                    </div>
                  ) : request.responseMessage ? (
                    <div className="response-note-box">Yanıt notu: {request.responseMessage}</div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
