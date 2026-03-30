# Hasat Zamanı

Hasat Zamanı, emeklilik sonrası eski ekip arkadaşları, öğrenciler, çalışanlar veya dostlarla yeniden bir araya gelmeyi kolaylaştıran paylaşılabilir profil ve buluşma planlama uygulamasıdır.

## Özellikler

- E-posta ve şifre ile giriş / kayıt
- Kişisel profil sayfası oluşturma
- Paylaşılabilir özel bağlantı (`/u/kullanici-slug`)
- Şehir + tarih + saat bazlı müsaitlik ekleme
- Ziyaretçilerin not bırakarak buluşma isteği göndermesi
- Panelden kabul / red akışı
- Firebase Hosting ile ücretsiz yayınlama

## Kullanılan Teknolojiler

- React + Vite
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

## Kurulum

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Firebase'e Yayınlama

1. Firebase projesi oluştur.
2. Authentication bölümünde **Email/Password** yöntemini aktif et.
3. Firestore Database oluştur.
4. `.env.example` dosyasını `.env` olarak kopyala ve Firebase web app bilgilerini ekle.
5. Terminalde aşağıdaki adımları çalıştır:

```bash
npm install -g firebase-tools
firebase login
firebase init
npm run build
firebase deploy
```

`firebase init` sırasında:

- **Firestore** seç
- **Hosting** seç
- Mevcut Firebase projesini bağla
- Public directory olarak `dist` yaz
- Single-page app sorusuna `Yes` de
- GitHub Actions sorusuna istersen `No` de

## Önemli Not

Bu sürümde ziyaretçiler hesap açmadan buluşma isteği gönderebilir. Panel tarafı yalnızca hesap sahibi tarafından yönetilir.
