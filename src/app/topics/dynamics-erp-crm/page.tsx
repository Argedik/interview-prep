import { TopicPage } from '@/components/TopicPage';

export default function DynamicsErpCrmPage() {
	return (
		<TopicPage
			title="Dynamics 365: ERP vs CRM"
			titleEn="Enterprise Resource Planning vs Customer Relationship Management"
			description="ERP (Kurumsal Kaynak Planlaması) şirketin iç operasyonlarını yönetir: finans, stok, üretim, tedarik. CRM (Müşteri İlişkileri Yönetimi) dış müşteri ilişkilerini yönetir: satış, pazarlama, destek. İkisi birlikte uçtan uca iş süreçlerini kapsar."
			descriptionEn="ERP manages internal operations: finance, inventory, manufacturing, procurement. CRM manages external customer relationships: sales, marketing, support. Together they cover end-to-end business processes."
			context={{
				erp: "Dynamics 365 Finance & Supply Chain: Fatura kesilmesi, stok hareketi, satınalma siparişi, üretim emri, depo transferi, mali raporlama. ETG'nin ana odağı bu modüller.",
				crm: 'Dynamics 365 Sales/Customer Service: Müşteri adayı (Lead) yönetimi, fırsat takibi, teklif hazırlama, destek talepleri (Case), saha servisi. Satış sonrası destek ile ERP entegrasyonu kritik.',
			}}
			naiveApproach={{
				explanation:
					"Departmanlar arasında entegrasyon olmadan, her departman kendi Excel/Access veritabanını kullanır. Satış departmanı müşteri siparişini Excel'e yazar, depo ayrı bir sistemde stok takip eder, muhasebe kendi yazılımında fatura keser.",
				code: `// ❌ YANLIŞ: Entegre olmayan sistemler

// sales_department.xlsx
| Müşteri   | Sipariş No | Ürün      | Adet | Durum    |
|-----------|------------|-----------|------|----------|
| ABC Ltd   | S-001      | Laptop    | 50   | Onaylandı|

// warehouse_access.mdb  
| Ürün      | Stok | Son Güncelleme |
|-----------|------|----------------|
| Laptop    | 30   | 15.01.2026     |  // ⚠️ Aslında 20 kalmış!

// accounting_system.exe
Fatura No: F-001
Müşteri: ABC Ltd
Tutar: 50.000 TL  // ⚠️ Satış 45.000 TL demişti!

// ❌ Problemler:
// - Stok bilgisi güncel değil → 50 laptop satıldı ama 30 var
// - Fiyat tutarsızlığı → Satış ve muhasebe farklı tutar
// - Sipariş durumu takip edilemiyor
// - Raporlama imkansız`,
				language: 'text',
			}}
			problems={[
				'VERİ TUTARSIZLIĞI: Her departman farklı veri tutuyor. Satış 50 ürün satıyor ama depoda 30 var → müşteriye yanlış söz veriliyor.',
				"MANUEL SENKRONASYON: Birisi Excel'den Access'e, oradan muhasebe sistemine veri elle aktarıyor → insan hatası kaçınılmaz.",
				'GECİKME: Stok güncellemesi 1 gün sonra yapılıyor → gerçek zamanlı karar alınamıyor.',
				"RAPORLAMA İMKANSIZ: 'Bu ay kaç müşteriye ne sattık, kar marjı nedir?' sorusu 3 sistemi birleştirmeyi gerektiriyor.",
				'ÖLÇEKLENME SORUNU: 10 kişi Excel paylaşıyor → dosya bozuluyor, versiyon karışıyor.',
			]}
			betterApproach={{
				explanation:
					'Dynamics 365 ile ERP ve CRM tek platformda, ortak veri modeli (Dataverse) üzerinde çalışır. Satış siparişi girdiğinde otomatik olarak stok kontrol edilir, fatura oluşturulur, müşteri geçmişi güncellenir.',
				code: `// ✅ DOĞRU: Entegre Dynamics 365 Akışı

// 1. CRM: Satış fırsatı → Sipariş
SalesOrder order = new SalesOrder {
    CustomerId = "ACC-001",      // CRM'den müşteri
    OrderDate = DateTime.Now,
    Lines = new List<SalesOrderLine> {
        new SalesOrderLine {
            ProductId = "LAPTOP-001",
            Quantity = 50,
            UnitPrice = 1000m    // Fiyat listesinden otomatik
        }
    }
};

// 2. ERP: Otomatik stok kontrolü (gerçek zamanlı)
var availability = InventoryService.CheckAvailability(
    productId: "LAPTOP-001",
    warehouseId: "WH-ISTANBUL",
    requestedQty: 50
);
// availability.OnHand = 80  ✅ Yeterli stok var

// 3. ERP: Stok rezervasyonu
InventoryService.Reserve(order.Id, lines: order.Lines);
// Stok: 80 - 50 = 30 (rezerve), gerçek zamanlı güncellendi

// 4. ERP: Fatura otomatik oluşturulur
Invoice invoice = FinanceService.CreateInvoice(order);
// Fatura tutarı: 50 x 1000 = 50.000 TL (tutarlı)

// 5. CRM: Müşteri 360° görünümü güncellendi
CustomerService.UpdateHistory(customerId: "ACC-001", 
    orderId: order.Id,
    invoiceId: invoice.Id,
    totalValue: 50000m);

// ✅ Sonuç:
// - Tek veri kaynağı (single source of truth)
// - Gerçek zamanlı stok
// - Otomatik fatura
// - 360° müşteri görünümü`,
				language: 'csharp',
			}}
			comparison={[
				{
					criteria: 'Veri Tutarlılığı',
					before: 'Her sistem farklı veri',
					after: 'Tek veri kaynağı (Dataverse)',
				},
				{
					criteria: 'Stok Güncelliği',
					before: '1 gün gecikme',
					after: 'Gerçek zamanlı',
				},
				{
					criteria: 'Fatura Oluşturma',
					before: 'Manuel, hata riski',
					after: 'Otomatik, tutarlı',
				},
				{
					criteria: 'Raporlama',
					before: '3 sistem birleştir',
					after: 'Tek tıkla Power BI',
				},
				{
					criteria: 'Müşteri Görünümü',
					before: 'Parçalı bilgi',
					after: '360° tam görünüm',
				},
				{
					criteria: 'Hata Oranı',
					before: 'Yüksek (manuel)',
					after: 'Düşük (otomatik)',
				},
			]}
			interviewQuestions={[
				{
					question: 'ERP ve CRM arasındaki temel fark nedir?',
					questionEn: 'What is the fundamental difference between ERP and CRM?',
					answer:
						"ERP şirketin İÇ operasyonlarını yönetir (finans, stok, üretim), CRM DIŞ müşteri ilişkilerini yönetir (satış, pazarlama, destek). Dynamics 365'te ikisi Dataverse üzerinde entegre çalışır.",
					answerEn:
						'ERP manages INTERNAL operations (finance, inventory, manufacturing), CRM manages EXTERNAL customer relationships (sales, marketing, support). In Dynamics 365, both integrate on Dataverse.',
				},
				{
					question:
						'Bir satış siparişi girildiğinde hangi ERP modülleri etkilenir?',
					questionEn:
						'Which ERP modules are affected when a sales order is entered?',
					answer:
						'1) Inventory: Stok rezervasyonu, 2) Warehouse: Sevkiyat planlama, 3) Finance: Alacak kaydı ve fatura, 4) Procurement: Stok azsa otomatik satınalma talebi tetiklenebilir.',
					answerEn:
						'1) Inventory: Stock reservation, 2) Warehouse: Shipment planning, 3) Finance: Receivable and invoice, 4) Procurement: May trigger purchase requisition if stock is low.',
				},
				{
					question: 'Satış sonrası iade işlemi CRM mi ERP mi?',
					questionEn: 'Is a post-sale return process handled by CRM or ERP?',
					answer:
						"İKİSİ DE. CRM'de destek talebi (Case) açılır, müşteri iletişimi yönetilir. ERP'de iade siparişi, stok girişi, kredi notu (fatura iadesi) işlenir. Süreç entegre akmalı.",
					answerEn:
						'BOTH. CRM handles support case and customer communication. ERP processes return order, inventory receipt, credit note. The process must flow integrated.',
				},
				{
					question: 'Dataverse nedir ve neden önemli?',
					questionEn: 'What is Dataverse and why is it important?',
					answer:
						"Dataverse (eski adı CDS), Microsoft'un düşük kodlu veri platformu. ERP, CRM ve Power Platform aynı veri modelini paylaşır. Entegrasyon kolaylaşır, veri tutarlılığı sağlanır.",
					answerEn:
						"Dataverse (formerly CDS) is Microsoft's low-code data platform. ERP, CRM, and Power Platform share the same data model. Simplifies integration and ensures data consistency.",
				},
				{
					question: 'Finance vs Supply Chain Management farkı?',
					questionEn:
						"What's the difference between Finance and Supply Chain Management?",
					answer:
						'Finance: Genel muhasebe, alacak/borç, sabit kıymet, bütçe, nakit yönetimi (para odaklı). Supply Chain: Stok, depo, satınalma, satış, üretim, lojistik (mal/malzeme odaklı).',
					answerEn:
						'Finance: GL, AR/AP, fixed assets, budgeting, cash management (money-focused). Supply Chain: Inventory, warehouse, procurement, sales, manufacturing, logistics (goods-focused).',
				},
			]}
			pitfalls={[
				"TUZAK: 'CRM sadece satış içindir' → Yanlış! Marketing, Customer Service, Field Service de CRM kapsamında.",
				"TUZAK: 'ERP ve CRM ayrı sistemler, bağımsız çalışır' → Dynamics 365'te entegre, Dataverse üzerinde ortak veri.",
			]}
			miniTask={{
				description:
					'Aşağıdaki senaryoyu ERP ve CRM süreçlerine ayırın: Bir müşteri online sipariş veriyor → Sipariş onaylanıyor → Ürün depodan sevk ediliyor → Fatura kesiliyor → Müşteri ürünü iade etmek istiyor → Destek talebi açılıyor → İade onaylanıyor → Para iade ediliyor.',
				hint: "Online sipariş: CRM (veya e-ticaret). Sevkiyat, fatura: ERP. İade talebi: CRM'de başlar, ERP'de tamamlanır.",
			}}
		/>
	);
}
