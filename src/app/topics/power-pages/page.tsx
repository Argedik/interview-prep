import { TopicPage } from '@/components/TopicPage';

export default function PowerPagesPage() {
	return (
		<TopicPage
			title="Power Pages"
			titleEn="External-Facing Business Websites and Portals"
			description="Power Pages (eski adı Power Apps Portals), dış kullanıcılara (müşteri, tedarikçi, partner) yönelik web portalları oluşturma platformu. Dataverse verileriyle entegre, Azure AD B2C ile harici kimlik doğrulama. Müşteri self-servis, partner portalı, başvuru formları."
			descriptionEn="Power Pages (formerly Power Apps Portals) is a platform for creating external-facing web portals. Integrates with Dataverse data, Azure AD B2C for external authentication. Customer self-service, partner portals, application forms."
			context={{
				erp: "Müşteri portalı: Müşteri kendi siparişlerini, faturalarını, sevkiyat durumunu görebiliyor. ERP'ye erişim vermeden self-servis sağlanıyor.",
				crm: 'Partner portalı: Bayiler fırsat kaydı yapabiliyor, teklif oluşturabiliyor. CRM lisansı vermeden partner işbirliği yapılıyor.',
			}}
			naiveApproach={{
				explanation:
					'Her müşteri sorusu için telefon/email ile yanıt veriliyor. Sipariş durumu, fatura bilgisi, her şey için müşteri temsilcisi gerekiyor. Çağrı merkezi yükü artıyor.',
				code: `# ❌ YANLIŞ: Müşteri self-servis yok

## Senaryo: Müşteri sipariş durumu öğrenmek istiyor

### Mevcut Süreç:
1. Müşteri çağrı merkezini arıyor (5 dk bekleme)
2. Temsilci ERP'ye giriyor, sipariş arıyor
3. "Siparişiniz kargoda, 2 güne teslim" diyor
4. Müşteri kapattı... ama yarın yine arayacak: "Nerede kargo?"

### Haftalık Yük:
- 500 arama/hafta sadece "Siparişim nerede?" sorusu
- Her arama 5 dakika = 2500 dakika = ~42 saat/hafta
- 1 tam zamanlı personel sadece buna cevap veriyor!

### Fatura Sorguları:
- "Son 3 ayın faturalarını gönderir misiniz?"
- Muhasebeci PDF oluşturuyor, email atıyor
- 100 müşteri x 5 dakika = 500 dakika/ay

# ❌ Problemler:
# - Personel maliyeti yüksek
# - Müşteri memnuniyeti düşük (bekleme süresi)
# - 7/24 hizmet veremiyoruz
# - Her soru için insan gerekiyor
# - Ölçeklenemiyor`,
				language: 'markdown',
			}}
			problems={[
				'PERSONEL MALİYETİ: Her basit soru için eğitimli personel gerekiyor. Sipariş durumu bile 5 dakika alıyor.',
				'BEKLEME SÜRESİ: Müşteri telefonda 5-10 dakika bekliyor. Memnuniyet düşüyor, şikayet artıyor.',
				'7/24 HİZMET YOK: Çağrı merkezi 09-18 çalışıyor. Gece sipariş sorgulama imkansız.',
				'ÖLÇEKLENEMİYOR: 1000 müşteri okay, 10.000 müşteri = 10x personel mi?',
				'HATA RİSKİ: Personel yanlış bilgi verebilir, unutabilir, geç yanıt verebilir.',
			]}
			betterApproach={{
				explanation:
					'Power Pages ile müşteri portalı: Login sonrası kendi siparişleri, faturaları, destek talepleri görünür. 7/24 self-servis, personel yükü azalır, müşteri memnuniyeti artar.',
				code: `// ✅ DOĞRU: Power Pages ile müşteri self-servis portalı

// Portal Yapısı:
CustomerPortal (https://portal.sirket.com)
├── Home (public)
├── Login (Azure AD B2C)
├── My Orders (authenticated)
│   ├── Order List (Entity List)
│   └── Order Detail (Entity Form - readonly)
├── My Invoices (authenticated)
│   ├── Invoice List
│   └── Invoice PDF Download
├── Support (authenticated)
│   ├── My Tickets (Entity List)
│   └── New Ticket (Entity Form)
└── Contact Us (public - Basic Form)

// 1. Portal Yapılandırması (Dataverse)
// Site Settings:
{
    "Authentication/Registration/Enabled": "true",
    "Authentication/Registration/AzureADB2C/Enabled": "true",
    "Authentication/Registration/LocalLogin/Enabled": "false"
}

// 2. Entity Permission (Güvenlik)
// Müşteri sadece KENDİ kayıtlarını görebilir
EntityPermission: {
    Entity: "SalesOrder",
    Scope: "Contact",  // Contact = login olan kullanıcı
    Privileges: ["Read"],  // Sadece okuma
    Relationship: "contact_salesorders"
}

// 3. Web Page: Siparişlerim
<div class="orders-page">
    <h1>Siparişlerim</h1>
    
    <!-- Entity List: Filtrelenmiş sipariş listesi -->
    {% entitylist id:"my-orders-list" %}
        {% for order in entitylist.records %}
        <div class="order-card">
            <span>{{ order.ordernumber }}</span>
            <span>{{ order.createdon | date: "%d.%m.%Y" }}</span>
            <span class="status-{{ order.statuscode }}">
                {{ order.statuscode | entity_status }}
            </span>
            <a href="/order/{{ order.id }}">Detay</a>
        </div>
        {% endfor %}
    {% endentitylist %}
</div>

// 4. Liquid Template: Sipariş Detay
{% entityview id:"order-detail-view" %}
    <h2>Sipariş #{{ page.adx_entityform.record.ordernumber }}</h2>
    
    <div class="order-info">
        <p><strong>Tarih:</strong> {{ record.createdon | date: "%d.%m.%Y" }}</p>
        <p><strong>Durum:</strong> {{ record.statuscode | entity_status }}</p>
        <p><strong>Toplam:</strong> {{ record.totalamount | money }}</p>
    </div>
    
    <!-- Kargo Takip -->
    {% if record.trackingnumber %}
    <div class="tracking">
        <p>Kargo Takip No: {{ record.trackingnumber }}</p>
        <a href="https://kargo.com/track/{{ record.trackingnumber }}" 
           target="_blank">Kargo Takip →</a>
    </div>
    {% endif %}
{% endentityview %}

// ✅ Sonuç:
// - 7/24 müşteri self-servis
// - %70 çağrı merkezi yükü azalması
// - Anında sipariş/fatura erişimi
// - Güvenli (sadece kendi verileri)
// - Mobil responsive`,
				language: 'html',
			}}
			comparison={[
				{
					criteria: 'Sipariş Sorgulama',
					before: 'Telefon, 5 dk bekleme',
					after: 'Anında, self-servis',
				},
				{
					criteria: 'Çalışma Saati',
					before: '09:00-18:00',
					after: '7/24',
				},
				{
					criteria: 'Çağrı Merkezi Yükü',
					before: '100%',
					after: '~30% (sadece karmaşık konular)',
				},
				{
					criteria: 'Fatura Erişimi',
					before: 'Email ile talep, 1 gün',
					after: 'Anında PDF indirme',
				},
				{
					criteria: 'Müşteri Memnuniyeti',
					before: 'Düşük (bekleme)',
					after: 'Yüksek (anında)',
				},
				{
					criteria: 'Personel Maliyeti',
					before: 'Yüksek',
					after: 'Düşük',
				},
			]}
			interviewQuestions={[
				{
					question: 'Power Pages ile Power Apps farkı nedir?',
					questionEn:
						"What's the difference between Power Pages and Power Apps?",
					answer:
						'Power Apps: İç kullanıcılar (çalışanlar), Azure AD ile login, Canvas/Model-driven. Power Pages: Dış kullanıcılar (müşteri, partner), Azure AD B2C, web portal, anonymous erişim olabilir.',
					answerEn:
						'Power Apps: Internal users (employees), Azure AD login, Canvas/Model-driven. Power Pages: External users (customers, partners), Azure AD B2C, web portal, can have anonymous access.',
				},
				{
					question: 'Entity Permission nedir?',
					questionEn: 'What is Entity Permission?',
					answer:
						'Dataverse tablolarına portal kullanıcı erişimini kontrol eder. Scope: Global (herkese), Contact (sadece kendi), Account (şirketinin), Parent (üst kayıt). Privileges: Create, Read, Update, Delete.',
					answerEn:
						"Controls portal user access to Dataverse tables. Scope: Global (everyone), Contact (own only), Account (company's), Parent (parent record). Privileges: CRUD.",
				},
				{
					question: 'Liquid nedir ve nerede kullanılır?',
					questionEn: 'What is Liquid and where is it used?',
					answer:
						"Shopify'ın geliştirdiği template dili. Power Pages'te dinamik HTML üretimi: döngüler, koşullar, veri gösterimi. {{ }} değişken, {% %} mantık. Dataverse verilerini HTML'e render eder.",
					answerEn:
						'Template language developed by Shopify. Used in Power Pages for dynamic HTML: loops, conditions, data display. {{ }} for variables, {% %} for logic. Renders Dataverse data to HTML.',
				},
				{
					question: 'Azure AD B2C nedir?',
					questionEn: 'What is Azure AD B2C?',
					answer:
						"Business to Consumer identity platform. Dış kullanıcılar (müşteri, partner) için kimlik yönetimi. Social login (Google, Facebook), email/password, MFA. Şirket Azure AD'den ayrı, daha ölçeklenebilir.",
					answerEn:
						'Business to Consumer identity platform. Identity management for external users. Social login, email/password, MFA. Separate from corporate Azure AD, more scalable.',
				},
				{
					question: 'Power Pages maliyeti nasıl hesaplanır?',
					questionEn: 'How is Power Pages pricing calculated?',
					answer:
						'Authenticated users ve page views bazlı. Aylık unique login sayısı + sayfa görüntüleme. Anonymous erişim daha ucuz. Capacity add-on ile artırılabilir.',
					answerEn:
						'Based on authenticated users and page views. Monthly unique logins + page views. Anonymous access cheaper. Can increase with capacity add-ons.',
				},
			]}
			pitfalls={[
				"TUZAK: 'Power Pages ile full website yapabilirim' → Sınırlı! Blog, e-ticaret, karmaşık UI için değil. İş süreci portalları için ideal.",
				"TUZAK: 'Entity Permission vermedim, müşteri başkasının verisini görüyor' → Güvenlik açığı! Her zaman Scope ayarla, test et.",
			]}
			miniTask={{
				description:
					'Basit bir müşteri portalı sayfası tasarlayın: 1) Login sonrası karşılama mesajı (kullanıcı adı ile), 2) Son 5 sipariş listesi, 3) Her siparişte tarih, tutar, durum. Liquid syntax kullanın.',
				hint: '{{ user.fullname }} ile kullanıcı adı. {% entitylist %} ile sipariş listesi. {{ order.createdon | date }} ile tarih formatla.',
			}}
		/>
	);
}
