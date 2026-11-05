# 🌐 Gemini Makine Çevirisi Uygulaması

Google Gemini API ile çalışan, Node.js ve Express tabanlı modern bir makine çevirisi uygulamasıdır. DeepL tarzı iki sütunlu, kırmızı-siyah zarif bir arayüze sahiptir.

---

## 🚀 Yeni Başlayanlar İçin Kurulum ve Çalıştırma Adımları

### 1. Adım: API Anahtarınızı `.env` Dosyasına Ekleyin
Proje klasöründeki [`.env`](file:///c:/Users/PCLAB1/Desktop/Yeni%20proje/.env) dosyasını herhangi bir metin düzenleyiciyle açın ve Gemini API anahtarınızı yapıştırın:

```env
GEMINI_API_KEY=AIzaSy...BURAYA_KENDI_ANAHTARINIZI_YAPISTIRIN
PORT=3000
```
> **Not:** Gemini API anahtarınızı ücretsiz olarak [Google AI Studio](https://aistudio.google.com/) üzerinden alabilirsiniz.

---

### 2. Adım: Gerekli Paketleri Yükleyin
Proje dizininde bir terminal açın (Windows'ta `cmd` veya `PowerShell`) ve şu komutu çalıştırın:

```bash
npm install
```

*(Not: Bu işlem uygulamanın çalışması için gereken `express`, `@google/genai` ve `dotenv` paketlerini yükler.)*

---

### 3. Adım: Sunucuyu Başlatın
Terminalde şu komutu çalıştırın:

```bash
npm start
```

Terminalde şu mesajı göreceksiniz:
```text
=================================================
🚀 Gemini Çeviri Uygulaması Başarıyla Çalıştı!
🌐 Tarayıcınızda açın: http://localhost:3000
=================================================
```

---

### 4. Adım: Tarayıcıda Açın
Web tarayıcınızı (Chrome, Edge, Brave vb.) açın ve şu adrese gidin:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🌟 Uygulamanın Özellikleri

1. **İki Sütunlu DeepL Görünümü (Kırmızı & Siyah):**
   - Koyu füme/siyah arka plan üzerine zarif kırmızı vurgular, modern tipografi ve kart tasarımı.
   - Mobil, tablet ve masaüstü ekranlarıyla %100 uyumludur (Responsive).

2. **Diller & Hızlı Değiştirme:**
   - İngilizce, Türkçe, İspanyolca, Almanca, Fransızca, İtalyanca, Rusça, Arapça ve Japonca desteği.
   - Ortadaki `⇄` düğmesiyle dilleri ve mevcut metinleri tek tıkla takas edebilme.

3. **Alan (Domain) ve Üslup (Style) Seçimi:**
   - **Çeviri Alanı:** *Genel* (doğrudan/net) veya *Edebi* (sanatsal/ahenkli).
   - **Üslup & Ton:** *Resmi* (kurumsal/saygılı) veya *Gündelik* (samimi/akıcı konuşma dili).
   - Seçimler Gemini modeline gönderilen sistem talimatını anında adapte eder.

4. **Zorunlu Terimce (Glossary):**
   - "Terimce (Glossary)" panelini açarak satır satır `kaynak terim = hedef terim` kuralları belirleyebilirsiniz.
   - Örn: `AI = Yapay Zekâ` veya `machine learning = makine öğrenimi`. Model bu kurallara kesinlikle uyar.

5. **Temiz Çıktı Garantisi:**
   - Sistem direktifi gereği model tırnak işareti, ek açıklama veya *"İşte çeviriniz:"* gibi fazlalıklar olmadan **yalnızca çevrilmiş metni** döndürür.

6. **Kullanıcı Dostu Türkçe Hata Yönetimi:**
   - API anahtarının eksik veya geçersiz olması durumunda ne yapmanız gerektiği kutu içinde Türkçe olarak gösterilir.
   - Kota aşımı, internet kesintisi veya sunucu hataları anlaşılır çözümlerle kullanıcıya sunulur.

7. **Kullanışlı Kısayollar ve Araçlar:**
   - **Tek tıkla Kopyala:** Çeviriyi kopyalayıp görsel onay verir.
   - **Panodan Yapıştır:** Kaynak metin kutusuna tek tıkla yapıştırma.
   - **Klavye Kısayolu:** `Ctrl + Enter` tuş kombinasyonuyla doğrudan çeviri yapabilirsiniz.
