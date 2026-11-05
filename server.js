// Ortam değişkenlerini (.env dosyasını) yükle
require('dotenv').config();

const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON ve form verilerini işleyebilmek için middleware
app.use(express.json());
// "public" klasöründeki statik dosyaları (HTML, CSS, JS) sun
app.use(express.static(path.join(__dirname, 'public')));

// Terimce (Glossary) metnini ayrıştırma fonksiyonu
// Kullanıcı: "kaynak terim = hedef terim" satırları girer
function parseGlossary(glossaryText) {
    if (!glossaryText || typeof glossaryText !== 'string') return [];
    
    const entries = [];
    const lines = glossaryText.split('\n');
    
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;
        
        // '=' veya ':' ayracını destekle
        const separator = line.includes('=') ? '=' : (line.includes(':') ? ':' : null);
        if (separator) {
            const parts = line.split(separator);
            const sourceTerm = parts[0].trim();
            const targetTerm = parts.slice(1).join(separator).trim();
            if (sourceTerm && targetTerm) {
                entries.push({ source: sourceTerm, target: targetTerm });
            }
        }
    }
    return entries;
}

// Sistem talimatı (System Instruction / Prompt) oluşturma
function buildSystemInstruction(sourceLang, targetLang, domain, style, glossaryEntries) {
    const domainDesc = domain === 'literary' 
        ? 'Edebi, sanatsal, duyguyu ve ahengi koruyan bir dille' 
        : 'Genel, net ve amaca uygun doğrudan bir dille';

    const styleDesc = style === 'formal'
        ? 'Resmi, kurumsal, nezaketli ve profesyonel bir üslupla'
        : 'Gündelik, samimi, konuşma diline uygun ve akıcı bir üslupla';

    let prompt = `Sen profesyonel, yüksek doğrulukla çalışan bir makine çevirisi motorusun.
GÖREV: Aşağıdaki metni ${sourceLang} dilinden ${targetLang} diline çevir.

KAT'İ KURALLAR:
1. YALNIZCA çevrilmiş metni döndür.
2. Çıktıya asla tırnak işareti, "Çeviri:", "İşte çeviriniz:", notlar veya açıklamalar EKLEME.
3. Çeviri Alanı: ${domainDesc}.
4. Üslup: ${styleDesc}.
`;

    if (glossaryEntries && glossaryEntries.length > 0) {
        prompt += `\nZORUNLU TERİMCE (GLOSSARY) KURALLARI:
Metinde geçen şu terimleri istisnasız belirtilen karşılıklarıyla çevir:
`;
        glossaryEntries.forEach(item => {
            prompt += `- "${item.source}" => "${item.target}"\n`;
        });
        prompt += `Bu terim eşleştirmelerine kesinlikle sadık kal.\n`;
    }

    return prompt;
}

// Çeviri Endpoint'i
app.post('/api/translate', async (req, res) => {
    try {
        const { text, sourceLang, targetLang, domain, style, glossary } = req.body;

        // Metin doğrulaması
        if (!text || !text.trim()) {
            return res.status(400).json({ 
                error: 'Lütfen çevrilmesini istediğiniz bir metin girin.' 
            });
        }

        // API anahtarı kontrolü
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey.trim() === '' || apiKey === 'BURAYA_GEMINI_API_KEY_YAPISTIRIN') {
            return res.status(500).json({
                error: 'Gemini API anahtarı bulunamadı!',
                solution: 'Lütfen projenin ana dizinindeki .env dosyasını açın ve geçerli GEMINI_API_KEY bilginizi yapıştırıp sunucuyu yeniden başlatın.'
            });
        }

        // Gemini AI İstemcisi oluştur
        const ai = new GoogleGenAI({ apiKey: apiKey });

        // Terimceyi ayrıştır
        const glossaryEntries = parseGlossary(glossary);

        // Sistem talimatını oluştur
        const systemInstruction = buildSystemInstruction(
            sourceLang || 'Otomatik / İngilizce',
            targetLang || 'Türkçe',
            domain || 'general',
            style || 'formal',
            glossaryEntries
        );

        // Gemini Flash Lite Latest modeli ile çeviriyi al (Daima en güncel Flash Lite)
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: text,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2 // Çeviride tutarlılık ve doğruluk için düşük sıcaklık
            }
        });

        const translatedText = response.text ? response.text.trim() : '';

        return res.json({
            success: true,
            translation: translatedText
        });

    } catch (err) {
        console.error('Çeviri Hatası:', err);

        const errorMessage = err.message || '';
        let userMessage = 'Çeviri sırasında beklenmeyen bir hata oluştu.';
        let userSolution = 'Lütfen daha sonra tekrar deneyiniz.';

        // Bilinen Gemini API hata durumlarını kullanıcı dostu Türkçe mesajlara dönüştür
        if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('401') || errorMessage.includes('invalid api key')) {
            userMessage = 'Gemini API anahtarı geçersiz veya yetkisiz.';
            userSolution = 'Lütfen .env dosyasındaki GEMINI_API_KEY değerini kontrol edin. Google AI Studio üzerinden yeni bir anahtar alıp yapıştırabilirsiniz.';
        } else if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429') || errorMessage.includes('Quota')) {
            userMessage = 'Gemini API kullanım kotası aşıldı (Hız Sınırı).';
            userSolution = 'Kısa bir süre bekleyip tekrar deneyin veya Google AI Studio panelinden API kullanım kotalarınızı kontrol edin.';
        } else if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
            userMessage = 'Google Gemini sunucuları şu anda aşırı yoğun (503 High Demand).';
            userSolution = 'Birkaç saniye bekleyip "ÇEVİR" butonuna tekrar basın.';
        } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
            userMessage = 'Google sunucularına erişilemiyor (İnternet bağlantısı hatası).';
            userSolution = 'Lütfen internet bağlantınızı ve varsa proxy/VPN ayarlarınızı kontrol edin.';
        } else if (errorMessage.includes('Safety') || errorMessage.includes('blocked')) {
            userMessage = 'Metin güvenlik/etik filtrelerine takıldığı için çevrilemedi.';
            userSolution = 'Lütfen metnin içeriğini kontrol edip tekrar deneyin.';
        }

        return res.status(500).json({
            error: userMessage,
            solution: userSolution,
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 Gemini Çeviri Uygulaması Başarıyla Çalıştı!`);
    console.log(`🌐 Tarayıcınızda açın: http://localhost:${PORT}`);
    console.log(`=================================================\n`);
});
