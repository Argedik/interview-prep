import { TopicPage } from '@/components/TopicPage';

export default function PowerAppsPage() {
	return (
		<TopicPage
			title="Power Apps"
			titleEn="Low-Code Application Development Platform"
			description="Power Apps, kod yazmadan veya az kodla iş uygulamaları geliştirme platformu. Canvas (piksel-perfect UI) ve Model-driven (Dataverse tabanlı) iki tip. Dynamics 365 ve Microsoft 365 ile entegre. IT'ye bağımlılık azalır, iş birimleri kendi uygulamalarını yapar."
			descriptionEn="Power Apps is a low-code platform for building business applications. Canvas (pixel-perfect UI) and Model-driven (Dataverse-based) types. Integrates with Dynamics 365 and M365. Reduces IT dependency, business units build their own apps."
			context={{
				erp: "Depo stok sayım uygulaması: Depocu tablet ile raf raf gezip barkod okutup sayım yapıyor. Dynamics 365 Supply Chain'e otomatik yazılıyor.",
				crm: "Saha satış uygulaması: Satışçı müşteri ziyaretinde teklif hazırlıyor, imza alıyor. Dynamics 365 Sales'e anında entegre.",
			}}
			naiveApproach={{
				explanation:
					"Stok sayımı kağıt-kalemle yapılır, sonra Excel'e girilir, sonra ERP'ye manuel aktarılır. Hata oranı yüksek, süreç uzun, veri gecikmeli.",
				code: `# ❌ YANLIŞ: Kağıt-kalem ile stok sayımı

## Süreç (Toplam: 2-3 gün)

### Gün 1: Fiziksel Sayım
1. Depocu kağıt listeyle rafa gidiyor
2. Ürün adı ve sayıyı elle yazıyor
3. 500 kalem yazım = 3-4 saat
4. Yazı okunamıyor, silinmiş yerler var

### Gün 2: Excel'e Aktarım
1. Ofisteki personel kağıtları alıyor
2. Excel'e tek tek giriyor (2-3 saat)
3. Okunamayan yazılar için tahmin yapılıyor ⚠️
4. Toplama hataları düzeltiliyor

### Gün 3: ERP'ye Aktarım
1. Excel'den ERP'ye manuel import
2. Format uyuşmazlıkları düzeltiliyor
3. Stok farkları raporlanıyor (ama veri 3 gün eski!)

# ❌ Problemler:
# - 500 kalem x %2 hata = 10 yanlış kayıt
# - 3 gün gecikme, gerçek stok bilinmiyor
# - Aynı ürün farklı isimlerle yazılmış
# - İmza/onay süreci yok
# - Sayım geçmişi kayboluyor`,
				language: 'markdown',
			}}
			problems={[
				'HATA ORANI: El yazısı okuma hatası, toplama hatası, veri girişi hatası. 500 kalem = ~10-15 hatalı kayıt.',
				'ZAMAN KAYBI: Fiziksel sayım 4 saat + Excel 3 saat + ERP aktarım 2 saat = 9+ saat. Her sayımda tekrar.',
				'VERİ GECİKMESİ: Sayım ile ERP kaydı arasında 2-3 gün var. Bu sürede stok değişti, veri eskidi.',
				'İZLENEBİLİRLİK YOK: Kim saydı, ne zaman saydı, onay aldı mı? Audit trail yok.',
				'ÖLÇEKLENME: 5 depo varsa, 5x bu süreç. Merkezi takip imkansız.',
			]}
			betterApproach={{
				explanation:
					"Power Apps ile tablet/telefon uygulaması: Barkod tarama → sayı girişi → onay → Dynamics 365'e anında yazma. Gerçek zamanlı, hatasız, izlenebilir.",
				code: `// ✅ DOĞRU: Power Apps ile stok sayım uygulaması

// 1. Canvas App Yapısı
App: "StokSayim"
├── Screen1: Login (Azure AD SSO)
├── Screen2: Depo Seçimi
├── Screen3: Sayım Listesi
├── Screen4: Ürün Detay (Barkod tarama)
└── Screen5: Özet & Onay

// 2. Barkod Tarama ve Veri Girişi
// Power Apps > Insert > Media > Barcode Scanner

// OnScan event:
Set(varScannedProduct, 
    LookUp(
        Products, 
        Barcode = BarcodeScanner1.Value
    )
);
// Ürün bulundu, detay ekranına git
Navigate(Screen4_ProductDetail);

// Sayım kaydetme:
Patch(
    StockCounts,  // Dataverse tablosu
    Defaults(StockCounts),
    {
        ProductId: varScannedProduct.Id,
        ProductName: varScannedProduct.Name,
        ExpectedQty: varScannedProduct.OnHandQty,
        CountedQty: txtCountedQty.Text,
        Difference: txtCountedQty.Text - varScannedProduct.OnHandQty,
        CountedBy: User().Email,
        CountedAt: Now(),
        WarehouseId: varSelectedWarehouse.Id,
        Status: "Pending"
    }
);

// 3. Dynamics 365 Entegrasyonu
// Power Automate Flow: "StokSayim-ERP-Sync"
// Trigger: Dataverse > When a row is added
// Action: Dynamics 365 > Update inventory journal

// 4. Onay Süreci
If(
    CountDetails.Difference <> 0,
    // Fark varsa yönetici onayı gerekli
    Flow.Run("StokFarkOnayTalebi", CountDetails),
    // Fark yoksa otomatik onayla
    Patch(StockCounts, CountDetails, {Status: "Approved"})
);

// ✅ Sonuç:
// - Barkod ile hatasız ürün tanıma
// - Anında Dynamics 365 güncellemesi
// - Offline çalışma desteği
// - Kim, ne zaman, nerede saydı = audit trail
// - Dashboard'da anlık takip`,
				language: 'javascript',
			}}
			comparison={[
				{
					criteria: 'Sayım Süresi',
					before: '4 saat (kağıt)',
					after: '2 saat (mobil)',
				},
				{
					criteria: 'Veri Aktarım',
					before: '2-3 gün sonra',
					after: 'Anında (gerçek zamanlı)',
				},
				{
					criteria: 'Hata Oranı',
					before: '%2-3 (elle yazım)',
					after: '<%0.1 (barkod)',
				},
				{
					criteria: 'Audit Trail',
					before: 'Yok',
					after: 'Tam (kim, ne zaman, nerede)',
				},
				{
					criteria: 'Çoklu Depo',
					before: 'Senkronize edilemiyor',
					after: 'Merkezi dashboard',
				},
				{
					criteria: 'Onay Süreci',
					before: 'Manuel, kağıt imza',
					after: 'Dijital, Power Automate',
				},
			]}
			interviewQuestions={[
				{
					question: 'Canvas vs Model-driven App farkı nedir?',
					questionEn:
						"What's the difference between Canvas and Model-driven apps?",
					answer:
						'Canvas: Piksel-perfect UI, sıfırdan tasarla, herhangi veri kaynağı (Excel, SQL, API). Model-driven: Dataverse tabanlı, form/view otomatik, iş mantığı odaklı, enterprise-grade.',
					answerEn:
						'Canvas: Pixel-perfect UI, design from scratch, any data source. Model-driven: Dataverse-based, auto forms/views, business logic focused, enterprise-grade.',
				},
				{
					question: 'Power Apps hangi veri kaynaklarına bağlanabilir?',
					questionEn: 'What data sources can Power Apps connect to?',
					answer:
						'Dataverse (en iyi), SharePoint, SQL Server, Excel, Dynamics 365, Salesforce, REST API, 500+ connector. Premium connector için ek lisans gerekebilir.',
					answerEn:
						'Dataverse (best), SharePoint, SQL Server, Excel, Dynamics 365, Salesforce, REST API, 500+ connectors. Premium connectors may need extra license.',
				},
				{
					question: 'Delegation nedir ve neden önemli?',
					questionEn: 'What is delegation and why is it important?',
					answer:
						"Filtreleme/sıralama işleminin veri kaynağında mı yoksa app'te mi yapıldığı. Delegation desteklenmezse max 500-2000 satır getirilir. Büyük veri setlerinde kritik.",
					answerEn:
						'Whether filtering/sorting happens at data source or in app. Without delegation, max 500-2000 rows returned. Critical for large datasets.',
				},
				{
					question: "Power Apps'te offline çalışma nasıl yapılır?",
					questionEn: 'How does offline work in Power Apps?',
					answer:
						'SaveData/LoadData fonksiyonları ile local cache. Bağlantı gelince sync. ClearCollect ile veri indir, Patch ile gönder. Conflict resolution dikkat gerektirir.',
					answerEn:
						'SaveData/LoadData functions for local cache. Sync when connected. ClearCollect to download, Patch to send. Conflict resolution needs attention.',
				},
				{
					question: 'Power Apps güvenliği nasıl sağlanır?',
					questionEn: 'How is Power Apps security ensured?',
					answer:
						'Azure AD authentication, Dataverse role-based security, environment isolation, DLP policies (hangi connector kullanılabilir). Sensitive data için premium gerekebilir.',
					answerEn:
						'Azure AD authentication, Dataverse role-based security, environment isolation, DLP policies. May need premium for sensitive data.',
				},
			]}
			pitfalls={[
				"TUZAK: 'Power Apps her uygulamayı yapar' → Yanlış! Karmaşık iş mantığı, ağır hesaplama, yüksek performans gerekiyorsa custom kod daha iyi.",
				"TUZAK: 'Excel'e bağlandım, çalışıyor' → Dikkat! 500+ satırda delegation sorunu. Dataverse veya SQL tercih et.",
			]}
			miniTask={{
				description:
					'Basit bir stok sayım Canvas App tasarlayın: 1) Depo seçim ekranı, 2) Barkod tarama ekranı, 3) Miktar girişi, 4) Kaydet butonu. Hangi kontroller (Gallery, Form, Button, BarcodeScanner) kullanırsınız?',
				hint: "Screen1: Dropdown + Gallery depo listesi. Screen2: BarcodeScanner + TextInput (miktar) + Button (kaydet). Patch() ile Dataverse'e yaz.",
			}}
		/>
	);
}
