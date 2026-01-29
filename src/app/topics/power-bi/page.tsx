import { TopicPage } from '@/components/TopicPage';

export default function PowerBiPage() {
	return (
		<TopicPage
			title="Power BI"
			titleEn="Business Intelligence and Data Visualization"
			description="Power BI, iş verilerini görselleştiren ve interaktif raporlar oluşturan Microsoft aracı. Excel'den farklı olarak: otomatik yenileme, web paylaşımı, mobil erişim, gerçek zamanlı dashboard. ETL + veri modeli + DAX formülleri ile güçlü analizler."
			descriptionEn="Power BI is Microsoft's tool for visualizing business data and creating interactive reports. Unlike Excel: auto-refresh, web sharing, mobile access, real-time dashboards. Powerful analytics with ETL + data model + DAX formulas."
			context={{
				erp: "Dynamics 365 Finance: Aylık gelir-gider raporu, nakit akış tahmini, vadesi geçmiş alacaklar, bütçe vs fiili karşılaştırması. CFO her sabah dashboard'a bakıyor.",
				crm: 'Satış pipeline analizi: Fırsatların aşamalara göre dağılımı, kazanma oranı, satışçı performansı. Satış müdürü haftalık toplantıda ekrana yansıtıyor.',
			}}
			naiveApproach={{
				explanation:
					"Her departman kendi Excel dosyasında rapor yapıyor. Veriler manuel kopyalanıyor, güncelleme yok. Farklı Excel'lerdeki veriler uyuşmuyor. Üst yönetim 'gerçek rakam hangisi?' diye soruyor.",
				code: `# ❌ YANLIŞ: Excel tabanlı raporlama

## Senaryo: Nalbur dükkanı aylık satış raporu

### Muhasebecinin Excel'i (muhasebe_rapor.xlsx)
| Ay       | Toplam Satış | Kar    |
|----------|--------------|--------|
| Ocak     | 150.000 TL   | 25.000 |
| Şubat    | 180.000 TL   | 32.000 |

### Satışçının Excel'i (satis_rapor.xlsx)  
| Ay       | Toplam Satış | Adet   |
|----------|--------------|--------|
| Ocak     | 145.000 TL   | 1.200  |  # ⚠️ 5.000 TL fark!
| Şubat    | 175.000 TL   | 1.450  |  # ⚠️ 5.000 TL fark!

### Depocu'nun Excel'i (stok_rapor.xlsx)
| Ürün     | Satılan | Kalan  |
|----------|---------|--------|
| Çivi     | 500 kg  | 200 kg |
| Vida     | 300 kg  | 150 kg |

# ❌ Problemler:
# 1. Muhasebe ve satış rakamları uyuşmuyor (5.000 TL fark)
# 2. Patron "gerçek kar ne?" sorusuna cevap yok
# 3. Her ay manuel güncelleme gerekiyor
# 4. Geçmiş veriler kaybolabiliyor (dosya silinir, üstüne yazılır)
# 5. Mobil erişim yok, toplantıda laptop gerekiyor`,
				language: 'markdown',
			}}
			problems={[
				'VERİ TUTARSIZLIĞI: Her Excel farklı kaynak, farklı rakam. Muhasebe 150K, satış 145K diyor. Hangisi doğru?',
				'MANUEL GÜNCELLEME: Her ay veri kopyala-yapıştır. İnsan hatası, unutma, gecikme kaçınılmaz.',
				"VERSİYON KABUSU: 'rapor_final_v3_son_gercek.xlsx' - Hangisi en güncel?",
				'PAYLAŞIM ZORLUĞU: Email ile gönder, USB ile taşı. Herkes farklı versiyon görüyor.',
				"ANALİZ LİMİTİ: Excel pivot sınırlı. 'Hangi ürün hangi müşteri segmentinde en çok satıyor?' zor.",
			]}
			betterApproach={{
				explanation:
					"Power BI ile tek veri kaynağı (Dynamics 365 veya SQL), otomatik yenileme, interaktif dashboard. Herkes aynı veriyi görüyor. Mobil app'ten de erişilebilir.",
				code: `// ✅ DOĞRU: Power BI ile merkezi raporlama

// 1. Veri Kaynağı: Dynamics 365 veya SQL Server
// Power BI Desktop > Get Data > SQL Server
SELECT 
    MONTH(OrderDate) as Ay,
    SUM(TotalAmount) as ToplamSatis,
    SUM(TotalAmount - CostAmount) as Kar,
    COUNT(*) as SiparisAdedi
FROM SalesOrders
WHERE YEAR(OrderDate) = 2026
GROUP BY MONTH(OrderDate);

// 2. DAX Formülleri (Measures)
// KPI'lar için hesaplanmış metrikler

Toplam Satış = SUM(Sales[TotalAmount])

Kar Marjı % = 
    DIVIDE(
        SUM(Sales[TotalAmount]) - SUM(Sales[CostAmount]),
        SUM(Sales[TotalAmount]),
        0
    ) * 100

Önceki Ay Satış = 
    CALCULATE(
        [Toplam Satış],
        DATEADD(Calendar[Date], -1, MONTH)
    )

Büyüme % = 
    DIVIDE(
        [Toplam Satış] - [Önceki Ay Satış],
        [Önceki Ay Satış],
        0
    ) * 100

// 3. Otomatik Yenileme Ayarı
// Power BI Service > Dataset Settings > Scheduled Refresh
// Her gün 08:00'da otomatik güncelleme

// 4. Dashboard Öğeleri
// - KPI Card: Toplam Satış (150.000 TL) ↑ %20
// - Bar Chart: Aylık satış trendi
// - Pie Chart: Ürün kategorisi dağılımı
// - Table: En çok satan 10 ürün
// - Slicer: Tarih, müşteri segmenti filtresi

// ✅ Sonuç:
// - Tek veri kaynağı (single source of truth)
// - Otomatik güncelleme
// - Interaktif filtreler
// - Mobil erişim
// - Paylaşım linki ile herkes aynı veriyi görür`,
				language: 'javascript',
			}}
			comparison={[
				{
					criteria: 'Veri Kaynağı',
					before: 'Birden fazla Excel',
					after: 'Tek merkezi kaynak',
				},
				{
					criteria: 'Güncelleme',
					before: 'Manuel, haftada 1',
					after: 'Otomatik, günde N kez',
				},
				{
					criteria: 'Tutarlılık',
					before: 'Her dosya farklı',
					after: 'Tek gerçek (single truth)',
				},
				{
					criteria: 'Paylaşım',
					before: 'Email/USB',
					after: 'Link paylaş, embed et',
				},
				{
					criteria: 'Mobil Erişim',
					before: 'Yok',
					after: 'Power BI Mobile App',
				},
				{
					criteria: 'Interaktif Analiz',
					before: 'Sınırlı (pivot)',
					after: 'Drill-down, cross-filter',
				},
			]}
			interviewQuestions={[
				{
					question: 'Power BI Desktop ve Service farkı nedir?',
					questionEn:
						"What's the difference between Power BI Desktop and Service?",
					answer:
						"Desktop: Rapor geliştirme aracı, ücretsiz, local'de çalışır. Service: Cloud portal, raporları paylaşma/yayınlama, otomatik yenileme, dashboard oluşturma. Pro lisans gerekir.",
					answerEn:
						'Desktop: Report authoring tool, free, runs locally. Service: Cloud portal for sharing/publishing reports, auto-refresh, dashboards. Requires Pro license.',
				},
				{
					question: 'DAX nedir ve ne zaman kullanılır?',
					questionEn: 'What is DAX and when is it used?',
					answer:
						"Data Analysis Expressions - Power BI'ın formül dili. Measures (hesaplanmış metrikler) ve calculated columns için. Excel formüllerine benzer ama daha güçlü: CALCULATE, time intelligence.",
					answerEn:
						"Data Analysis Expressions - Power BI's formula language. For measures and calculated columns. Similar to Excel but more powerful: CALCULATE, time intelligence functions.",
				},
				{
					question: 'Import vs DirectQuery farkı?',
					questionEn: 'Import vs DirectQuery difference?',
					answer:
						"Import: Veri Power BI'a kopyalanır, hızlı ama eski veri. DirectQuery: Her sorguda kaynağa gider, gerçek zamanlı ama yavaş. Hybrid için Composite Model.",
					answerEn:
						'Import: Data copied to Power BI, fast but stale data. DirectQuery: Queries source each time, real-time but slow. Use Composite Model for hybrid.',
				},
				{
					question: 'Row-Level Security (RLS) nedir?',
					questionEn: 'What is Row-Level Security (RLS)?',
					answer:
						'Kullanıcıya göre veri filtreleme. Satışçı sadece kendi müşterilerini, bölge müdürü sadece kendi bölgesini görür. DAX ile rol tanımlanır, Azure AD ile eşleşir.',
					answerEn:
						'Filter data per user. Salesperson sees only their customers, regional manager sees only their region. Roles defined with DAX, mapped to Azure AD.',
				},
				{
					question: "Power BI neden Excel'den daha iyi?",
					questionEn: 'Why is Power BI better than Excel?',
					answer:
						'Otomatik yenileme, merkezi paylaşım, daha büyük veri (100M+ satır), interaktif dashboard, mobil app, Row-Level Security. Excel hala ad-hoc analiz için iyi.',
					answerEn:
						'Auto-refresh, centralized sharing, larger data (100M+ rows), interactive dashboards, mobile app, Row-Level Security. Excel still good for ad-hoc analysis.',
				},
			]}
			pitfalls={[
				"TUZAK: 'Power BI her şeyi çözer' → Veri kalitesi kötüyse rapor da kötü. Önce veri temizliği (Power Query ETL).",
				"TUZAK: 'DirectQuery her zaman kullan, gerçek zamanlı' → Yanlış! Yavaş ve kaynak yorar. Import tercih et, kritik veriler için DirectQuery.",
			]}
			miniTask={{
				description:
					"Bir nalbur dükkanı için basit satış dashboard'u tasarlayın. Şu KPI'ları gösterin: 1) Aylık toplam satış, 2) Kar marjı %, 3) En çok satan 5 ürün, 4) Aylık trend grafiği. Hangi DAX formüllerini kullanırsınız?",
				hint: 'SUM, DIVIDE, TOPN, DATEADD fonksiyonlarını kullan. Kar Marjı = (Satış - Maliyet) / Satış * 100',
			}}
		/>
	);
}
