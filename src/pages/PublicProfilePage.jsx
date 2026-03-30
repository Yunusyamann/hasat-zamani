import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    return <div className="page-center">Profil yükleniyor...</div>;
  }

  if (!profile) {
    return (
      <div className="container section-block narrow-wrap">
        <div className="panel-card center-state-card">
          <h1>Profil bulunamadı</h1>
          <p>Bağlantı yanlış olabilir ya da profil yayından kaldırılmış olabilir.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="public-shell-v2">
      <div className="container public-grid-v2">
        <aside className="profile-card-v2">
          <div className="section-chip subtle">Hasat Zamanı profili</div>
          <h1>{profile.displayName}</h1>
          <div className="public-role">{profile.title}</div>
          <p className="public-about">{profile.about}</p>

          <div className="profile-facts-v2">
            <div className="fact-item-v2">
              <span>Şu an bulunduğu şehir</span>
              <strong>{profile.currentCity || 'Belirtilmedi'}</strong>
            </div>
            <div className="fact-item-v2">
              <span>Karşılama notu</span>
              <strong>
                {profile.welcomeMessage || 'Eski günleri konuşmak için uygun bir zaman seçebilirsiniz.'}
              </strong>
            </div>
            {profile.linkedinUrl ? (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-block">
                LinkedIn profiline git
              </a>
            ) : null}
          </div>
        </aside>

        <div className="booking-area-v2">
          <section className="panel-card">
            <div className="panel-head">
              <div>
                <div className="small-kicker">Müsait zamanlar</div>
                <h2>Bir tarih ve saat seçin</h2>
              </div>
            </div>

            {success ? <div className="notice success">{success}</div> : null}
            {error ? <div className="notice error">{error}</div> : null}

            {slots.length === 0 ? (
              <div className="empty-box">Şu an yayınlanmış uygunluk bulunmuyor. Daha sonra tekrar bakabilirsiniz.</div>
            ) : (
              <div className="city-slot-groups-v2">
                {Object.entries(groupedSlots).map(([city, citySlots]) => (
                  <div key={city} className="city-slot-block-v2">
                    <div className="city-slot-head">
                      <h3>{city}</h3>
                      <span>{citySlots.length} slot</span>
                    </div>
                    <div className="slot-grid-v2">
                      {citySlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          className={selectedSlot?.id === slot.id ? 'slot-choice-card active' : 'slot-choice-card'}
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
          </section>

          <section className="panel-card">
            <div className="panel-head">
              <div>
                <div className="small-kicker">Buluşma isteği</div>
                <h2>
                  {selectedSlot
                    ? `${selectedSlot.city} · ${formatDate(selectedSlot.date)} için notunu bırak`
                    : 'Önce bir buluşma slotu seçin'}
                </h2>
              </div>
            </div>

            <form className="grid-form-v2 two-columns" onSubmit={handleSubmit}>
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

              <label className="col-span-2">
                Bulunduğunuz şehir
                <input
                  type="text"
                  name="requesterLocation"
                  value={requestForm.requesterLocation}
                  onChange={handleChange}
                  placeholder="Örn. Berlin"
                />
              </label>

              <label className="col-span-2">
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

              <button type="submit" className="btn btn-primary btn-block col-span-2" disabled={!selectedSlot || sending}>
                {sending ? 'Gönderiliyor...' : 'Buluşma isteğini gönder'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </section>
  );
}
