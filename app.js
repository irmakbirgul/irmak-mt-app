// ====================================================================
// GEMINI TRANSLATE - İstemci Tarafı JavaScript Mantığı
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // DOM Öğelerini Seçelim
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const domainSelect = document.getElementById('domainSelect');
    const styleSelect = document.getElementById('styleSelect');
    
    // Butonlar
    const translateBtn = document.getElementById('translateBtn');
    const swapLangBtn = document.getElementById('swapLangBtn');
    const clearSourceBtn = document.getElementById('clearSourceBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyBtnText = document.getElementById('copyBtnText');
    
    // Terimce (Glossary) Öğeleri
    const toggleGlossaryBtn = document.getElementById('toggleGlossaryBtn');
    const glossaryPanel = document.getElementById('glossaryPanel');
    const closeGlossaryBtn = document.getElementById('closeGlossaryBtn');
    const glossaryInput = document.getElementById('glossaryInput');
    const glossaryCount = document.getElementById('glossaryCount');
    const glossarySampleBtn = document.getElementById('glossarySampleBtn');

    // Durum ve Hata Öğeleri
    const loadingOverlay = document.getElementById('loadingOverlay');
    const statusIndicator = document.getElementById('statusIndicator');
    const charCount = document.getElementById('charCount');
    const targetCharCount = document.getElementById('targetCharCount');
    const errorBox = document.getElementById('errorBox');
    const errorTitle = document.getElementById('errorTitle');
    const errorMessage = document.getElementById('errorMessage');
    const errorSolutionText = document.getElementById('errorSolutionText');
    const closeErrorBtn = document.getElementById('closeErrorBtn');

    // 1. Karakter Sayacı Güncelleme
    function updateCharCounts() {
        charCount.textContent = `${sourceText.value.length} karakter`;
        targetCharCount.textContent = `${targetText.value.length} karakter`;
    }

    sourceText.addEventListener('input', updateCharCounts);

    // 2. Metin Temizleme
    clearSourceBtn.addEventListener('click', () => {
        sourceText.value = '';
        targetText.value = '';
        updateCharCounts();
        hideError();
        sourceText.focus();
    });

    // 3. Panodan Yapıştırma (Paste)
    pasteBtn.addEventListener('click', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText) {
                sourceText.value = clipboardText;
                updateCharCounts();
            }
        } catch (err) {
            console.warn('Panoya erişilemedi:', err);
            sourceText.focus();
        }
    });

    // 4. Çeviriyi Tek Tıkla Kopyalama (Copy)
    copyBtn.addEventListener('click', async () => {
        const textToCopy = targetText.value.trim();
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            copyBtn.classList.add('copied');
            copyBtnText.textContent = 'Kopyalandı!';
            copyBtn.querySelector('i').className = 'fa-solid fa-check';

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtnText.textContent = 'Kopyala';
                copyBtn.querySelector('i').className = 'fa-regular fa-copy';
            }, 2000);
        } catch (err) {
            console.error('Kopyalama hatası:', err);
        }
    });

    // 5. Dilleri Karşılıklı Değiştir (Swap Languages)
    swapLangBtn.addEventListener('click', () => {
        const tempLang = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = tempLang;

        // Varsa metinleri de yer değiştir
        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;

        updateCharCounts();
    });

    // 6. Terimce (Glossary) Paneli Açma / Kapatma
    function toggleGlossary() {
        const isHidden = glossaryPanel.classList.toggle('hidden');
        toggleGlossaryBtn.classList.toggle('active', !isHidden);
        toggleGlossaryBtn.setAttribute('aria-expanded', !isHidden);
        if (!isHidden) {
            glossaryInput.focus();
        }
    }

    toggleGlossaryBtn.addEventListener('click', toggleGlossary);
    closeGlossaryBtn.addEventListener('click', () => {
        glossaryPanel.classList.add('hidden');
        toggleGlossaryBtn.classList.remove('active');
        toggleGlossaryBtn.setAttribute('aria-expanded', 'false');
    });

    // Terimce sayısı rozetini güncelle
    function updateGlossaryCount() {
        const lines = glossaryInput.value.split('\n')
            .map(l => l.trim())
            .filter(l => l && (l.includes('=') || l.includes(':')) && !l.startsWith('#'));
        glossaryCount.textContent = lines.length;
    }

    glossaryInput.addEventListener('input', updateGlossaryCount);

    // Örnek Terimce Doldur
    glossarySampleBtn.addEventListener('click', () => {
        glossaryInput.value = `AI = Yapay Zekâ\nprompt = istem\ncloud computing = bulut bilişim\nbackend = arka uç`;
        updateGlossaryCount();
    });

    // 7. Hata Gösterme ve Gizleme Fonksiyonları
    function showError(title, message, solution) {
        errorTitle.textContent = title || 'Bir Hata Oluştu';
        errorMessage.textContent = message || 'İşlem tamamlanamadı.';
        errorSolutionText.textContent = solution || 'Lütfen internet bağlantınızı ve ayarlarınızı kontrol edin.';
        errorBox.classList.remove('hidden');
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideError() {
        errorBox.classList.add('hidden');
    }

    closeErrorBtn.addEventListener('click', hideError);

    // 8. Çeviri İsteği Gönderme (Gemini API Entegrasyonu)
    async function performTranslation() {
        const text = sourceText.value.trim();
        if (!text) {
            showError('Metin Boş', 'Lütfen çevirmek istediğiniz bir metin girin.', 'Sol taraftaki kutuya metninizi yazıp veya yapıştırıp tekrar "ÇEVİR" düğmesine basın.');
            sourceText.focus();
            return;
        }

        hideError();

        // UI Yükleniyor Durumu
        loadingOverlay.classList.remove('hidden');
        statusIndicator.className = 'status-indicator translating';
        statusIndicator.textContent = 'Çevriliyor...';
        translateBtn.disabled = true;

        try {
            const payload = {
                text: text,
                sourceLang: sourceLang.value,
                targetLang: targetLang.value,
                domain: domainSelect.value,
                style: styleSelect.value,
                glossary: glossaryInput.value
            };

            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // Sunucudan gelen kullanıcı dostu Türkçe hata mesajları
                showError(
                    'Çeviri Başarısız',
                    data.error || 'Gemini ile bağlantı kurulamadı.',
                    data.solution || 'Lütfen .env dosyanızdaki GEMINI_API_KEY bilginizi kontrol edin.'
                );
                return;
            }

            // Başarılı Çeviri
            targetText.value = data.translation;
            updateCharCounts();
            statusIndicator.className = 'status-indicator ready';
            statusIndicator.textContent = 'Tamamlandı';

        } catch (networkErr) {
            console.error('İstemci Ağı Hatası:', networkErr);
            showError(
                'Bağlantı Hatası',
                'Node.js sunucusuna veya internete ulaşılamıyor.',
                'Node.js terminalinde "npm start" ile sunucunun çalıştığından ve internet bağlantınızın aktif olduğundan emin olun.'
            );
        } finally {
            loadingOverlay.classList.add('hidden');
            translateBtn.disabled = false;
        }
    }

    // Buton Tıklaması ile Çevir
    translateBtn.addEventListener('click', performTranslation);

    // Klavye Kısayolu: Ctrl + Enter veya Cmd + Enter
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            performTranslation();
        }
    });

    // Başlangıç güncellemeleri
    updateCharCounts();
    updateGlossaryCount();
});
