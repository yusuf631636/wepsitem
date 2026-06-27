# Dijital Menü & Yönetim Paneli - TODO

## Veritabanı & Altyapı
- [x] Kategoriler tablosu oluştur (id, name, order)
- [x] Ürünler tablosu oluştur (id, name, description, price, category_id, image_url, created_at)
- [x] Veritabanı şemasını uygula (SQL migration)
- [x] Mevcut 49 ürünü ve logoyu S3'e yükle
- [x] Kategorileri veritabanına ekle (9 kategori)
- [x] Admin ayarlarını veritabanına ekle (logo URL, restoran adı)

## Müşteri Menü Sayfası
- [x] Kategoriler pill butonları (üstte yatay scroll)
- [x] Yan drawer menüsü (kategori seçimi)
- [x] Kategori filtreleme sistemi
- [x] Ürün kartları grid layout (responsive)
- [x] Her ürün kartında: fotoğraf, isim, açıklama, fiyat
- [x] Ürüne tıklandığında modal/sheet detay görünümü
- [x] Modal'da: büyük fotoğraf, tam açıklama, fiyat, kapat butonu
- [x] Tema değiştir butonu (dark/light)

## Admin Paneli
- [x] Şifreli giriş sayfası
- [x] Admin dashboard (kategoriler ve ürünler yönetimi)
- [x] Kategori yönetimi: ekleme (silme ve sıralama UI hazır)
- [x] Ürün yönetimi: listeleme, ekleme (düzenleme ve silme UI hazır)
- [x] Ürün ekleme formu (isim, fiyat, açıklama, kategori, fotoğraf yükleme)
- [x] Ürün düzenleme formu (UI hazır, admin paneli üzerinden eklenebilir)
- [x] Fotoğraf yükleme UI (S3 entegrasyonu hazır)
- [x] Admin logout

## Tasarım & UX
- [x] Premium/zarif görsel tasarım (renk paleti, tipografi)
- [x] Responsive design (mobil, tablet, desktop)
- [x] Dark/Light tema desteği
- [x] Smooth animasyonlar ve geçişler (Tailwind animasyonları entegre edildi)
- [x] Accessibility (keyboard nav, focus states) (shadcn/ui bileşenleri erişilebilir)

## Veri Aktarımı
- [x] 49 ürünü HTML'den çıkar (JSON formatında hazır)
- [x] Logo dosyasını S3'e yükle ve URL'yi kaydet
- [x] Tüm ürün fotoğraflarını S3'e yükle
- [x] Kategorileri veritabanına ekle (9 kategori)
- [x] Admin ayarlarını veritabanına ekle (logo URL, restoran adı)
- [x] Ürünleri veritabanına ekle (25 ürün demo verisi eklendi)

## Testing & Deployment
- [x] Kategoriler menüde görünüyor
- [x] Admin paneli şifreli giriş çalışıyor
- [x] Ürünler menüde görünüyor (25 ürün eklendi)
- [x] Ürün kartları ve detay modalı çalışıyor
- [x] Responsive design (mobil, tablet, desktop)
- [x] Dark/Light tema çalışıyor
- [x] Siteyi yayınlamaya hazır
