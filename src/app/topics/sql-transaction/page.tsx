import { TopicPage } from '@/components/TopicPage';

export default function SqlTransactionPage() {
	return (
		<TopicPage
			title="SQL: Transaction & Isolation"
			titleEn="Database Transactions and Isolation Levels"
			description="Transaction, birden fazla SQL işleminin 'ya hep ya hiç' mantığıyla çalışmasıdır (ACID). Isolation Level, eşzamanlı transaction'ların birbirini nasıl etkilediğini belirler. ERP'de kritik: para transferi, stok hareketi, fatura kesimi hep transaction içinde olmalı."
			descriptionEn="A transaction ensures multiple SQL operations work as 'all or nothing' (ACID). Isolation Level determines how concurrent transactions affect each other. Critical in ERP: money transfers, inventory movements, invoicing must be in transactions."
			context={{
				erp: 'Fatura keserken: 1) Fatura kaydı, 2) Stok düşümü, 3) Alacak kaydı hep birlikte olmalı. Biri başarısızsa hepsi geri alınmalı (rollback).',
				crm: 'Sipariş onayı: 1) Sipariş durumu güncelle, 2) Stok rezerve et, 3) Email tetikle. Atomik olmalı.',
			}}
			naiveApproach={{
				explanation:
					'Her SQL komutu ayrı ayrı çalıştırılır, transaction kullanılmaz. Ortada hata olursa yarım kalmış veri kalır. Tutarsız durum (inconsistent state) oluşur.',
				code: `-- ❌ YANLIŞ: Transaction olmadan işlem

-- Senaryo: A'dan B'ye 1000 TL para transferi

-- Adım 1: A'nın hesabından düş
UPDATE Accounts 
SET Balance = Balance - 1000 
WHERE AccountId = 'A';
-- ✅ Başarılı: A'nın bakiyesi azaldı

-- Adım 2: B'nin hesabına ekle
UPDATE Accounts 
SET Balance = Balance + 1000 
WHERE AccountId = 'B';
-- ❌ HATA! Sunucu çöktü, bağlantı koptu!

-- 💀 SONUÇ:
-- A'nın 1000 TL'si gitti
-- B'ye 1000 TL gelmedi
-- Toplam 1000 TL "kayboldu"!

-- Başka bir örnek: Fatura kesimi
-- Adım 1: Fatura kaydı oluştur
INSERT INTO Invoices (CustomerId, Amount, Date)
VALUES ('CUST-001', 5000, GETDATE());
-- ✅ Fatura oluştu

-- Adım 2: Stok düş
UPDATE Products 
SET Stock = Stock - 10 
WHERE ProductId = 'PROD-001';
-- ❌ HATA! Stok yetersiz, constraint violation!

-- 💀 SONUÇ:
-- Fatura kesildi (müşteri borçlu görünüyor)
-- Ama stok düşmedi (ürün hala stokta)
-- Tutarsız veri!`,
				language: 'sql',
			}}
			problems={[
				'VERİ KAYBI: Para transferinde ortada hata = para kaybolur. Geri dönüşü yok.',
				'TUTARSIZLIK: Fatura var ama stok düşmemiş, veya tam tersi. Muhasebe ve depo uyuşmuyor.',
				"DENETİM SORUNU: Audit'te 'bu para nereye gitti?' sorusu cevaplanamaz.",
				"MÜŞTERİ ŞİKAYETİ: 'Ödeme yaptım ama sipariş onaylanmadı' - Yarım kalan işlem.",
				'EŞZAMANLI ERİŞİM: İki kişi aynı anda aynı stoku satarsa ne olur? Overselling!',
			]}
			betterApproach={{
				explanation:
					'Transaction içinde tüm işlemler yapılır. Hata olursa ROLLBACK ile geri alınır. Isolation Level ile eşzamanlı erişim kontrol edilir. ACID garantisi sağlanır.',
				code: `-- ✅ DOĞRU: Transaction ile güvenli işlem

-- Senaryo: A'dan B'ye 1000 TL para transferi
BEGIN TRANSACTION;  -- Transaction başlat

BEGIN TRY
    -- Adım 1: A'nın hesabından düş
    UPDATE Accounts 
    SET Balance = Balance - 1000 
    WHERE AccountId = 'A';
    
    -- Bakiye kontrolü (negatif olmaz)
    IF (SELECT Balance FROM Accounts WHERE AccountId = 'A') < 0
    BEGIN
        RAISERROR('Yetersiz bakiye', 16, 1);
    END
    
    -- Adım 2: B'nin hesabına ekle
    UPDATE Accounts 
    SET Balance = Balance + 1000 
    WHERE AccountId = 'B';
    
    -- Her şey başarılı, kaydet
    COMMIT TRANSACTION;  -- ✅ Kalıcı yap
    
END TRY
BEGIN CATCH
    -- Hata oluştu, geri al
    ROLLBACK TRANSACTION;  -- ❌ Her şeyi geri al
    
    -- Hata logla
    INSERT INTO ErrorLog (Message, ErrorTime)
    VALUES (ERROR_MESSAGE(), GETDATE());
    
    -- Hatayı yukarı fırlat
    THROW;
END CATCH;

-- ✅ SONUÇ: Ya ikisi de olur, ya ikisi de olmaz!


-- Isolation Level örneği: Stok satışı
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;  -- En güvenli

BEGIN TRANSACTION;

-- Stok kontrolü (kilit alınır)
DECLARE @CurrentStock INT;
SELECT @CurrentStock = Stock 
FROM Products WITH (UPDLOCK, HOLDLOCK)  -- Kilit tut
WHERE ProductId = 'PROD-001';

IF @CurrentStock >= 10
BEGIN
    -- Stok yeterli, düş
    UPDATE Products 
    SET Stock = Stock - 10 
    WHERE ProductId = 'PROD-001';
    
    -- Satış kaydı
    INSERT INTO Sales (ProductId, Quantity, SaleDate)
    VALUES ('PROD-001', 10, GETDATE());
    
    COMMIT;
END
ELSE
BEGIN
    -- Stok yetersiz
    ROLLBACK;
    RAISERROR('Stok yetersiz', 16, 1);
END;

-- Isolation Levels karşılaştırması:
-- READ UNCOMMITTED: Dirty read olabilir (tehlikeli)
-- READ COMMITTED: Default, committed veri okunur
-- REPEATABLE READ: Aynı satır tekrar okunursa aynı değer
-- SERIALIZABLE: Tam izolasyon, seri çalışır gibi (yavaş)
-- SNAPSHOT: Optimistic, version-based (ölçeklenebilir)`,
				language: 'sql',
			}}
			comparison={[
				{
					criteria: 'Veri Tutarlılığı',
					before: 'Yarım kalabilir',
					after: 'Ya hep ya hiç (ACID)',
				},
				{
					criteria: 'Hata Durumu',
					before: 'Tutarsız veri kalır',
					after: 'Otomatik rollback',
				},
				{
					criteria: 'Eşzamanlı Erişim',
					before: 'Race condition',
					after: 'Isolation ile kontrol',
				},
				{
					criteria: 'Para/Stok Güvenliği',
					before: 'Kayıp riski',
					after: 'Garantili',
				},
				{
					criteria: 'Denetlenebilirlik',
					before: 'Zor',
					after: 'Tam (commit/rollback log)',
				},
				{
					criteria: 'Performans',
					before: 'Hızlı ama riskli',
					after: 'Biraz yavaş ama güvenli',
				},
			]}
			interviewQuestions={[
				{
					question: 'ACID ne demek?',
					questionEn: 'What does ACID stand for?',
					answer:
						"Atomicity (ya hep ya hiç), Consistency (tutarlı durumdan tutarlı duruma), Isolation (transaction'lar birbirini görmez), Durability (commit sonrası kalıcı). Transaction'ın 4 garantisi.",
					answerEn:
						"Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (transactions don't see each other), Durability (permanent after commit). 4 guarantees of transactions.",
				},
				{
					question: 'Deadlock nedir ve nasıl önlenir?',
					questionEn: 'What is a deadlock and how to prevent it?',
					answer:
						'İki transaction birbirinin kilidini bekler, ikisi de ilerleyemez. Önleme: Aynı sırada kilit al, kısa transaction, timeout, deadlock priority ayarla. SQL Server otomatik tespit edip birini rollback eder.',
					answerEn:
						"Two transactions wait for each other's locks, neither can proceed. Prevention: Lock in same order, short transactions, timeout, deadlock priority. SQL Server auto-detects and rolls back one.",
				},
				{
					question: 'READ COMMITTED vs SERIALIZABLE farkı?',
					questionEn: 'Difference between READ COMMITTED and SERIALIZABLE?',
					answer:
						'READ COMMITTED: Sadece committed veri okunur, ama aynı satır tekrar okunursa farklı olabilir (non-repeatable read). SERIALIZABLE: Tam izolasyon, sanki sırayla çalışıyormuş gibi, ama yavaş ve deadlock riski.',
					answerEn:
						'READ COMMITTED: Only reads committed data, but same row may differ on re-read. SERIALIZABLE: Full isolation, as if running serially, but slow with deadlock risk.',
				},
				{
					question: 'Optimistic vs Pessimistic locking farkı?',
					questionEn: 'Difference between Optimistic and Pessimistic locking?',
					answer:
						'Pessimistic: Önceden kilit al, başkası beklesin (SELECT FOR UPDATE). Optimistic: Kilit alma, kaydet anında versiyon kontrolü yap, değiştiyse hata ver. Okuma ağırlıklı sistemlerde optimistic daha iyi.',
					answerEn:
						'Pessimistic: Lock upfront, others wait (SELECT FOR UPDATE). Optimistic: No lock, check version on save, error if changed. Optimistic better for read-heavy systems.',
				},
				{
					question: 'SNAPSHOT isolation ne zaman kullanılır?',
					questionEn: 'When to use SNAPSHOT isolation?',
					answer:
						"Okuma ve yazma birbirini bloklamasın istendiğinde. Row versioning ile her transaction kendi snapshot'ını görür. Çakışma varsa yazma anında hata verir. Reporting + OLTP karışık sistemlerde ideal.",
					answerEn:
						"When reads and writes shouldn't block each other. Row versioning gives each transaction its snapshot. Conflicts error on write. Ideal for mixed reporting + OLTP systems.",
				},
			]}
			pitfalls={[
				"TUZAK: 'Her yerde SERIALIZABLE kullanayım, güvenli olsun' → Yanlış! Çok yavaş ve deadlock riski. Çoğu durumda READ COMMITTED yeterli.",
				"TUZAK: 'Transaction içinde 10 dakika işlem var' → Kötü! Transaction kısa tutulmalı. Uzun transaction = uzun kilit = diğerleri bekler = timeout.",
			]}
			miniTask={{
				description:
					"Bir sipariş onay transaction'ı yazın: 1) Sipariş durumunu 'Onaylandı' yap, 2) Stoktan düş, 3) Müşteri bakiyesinden düş. Herhangi bir adımda hata olursa tümünü geri al. Stok yetersizse hata ver.",
				hint: 'BEGIN TRANSACTION, TRY-CATCH, IF stok < sipariş THEN RAISERROR, COMMIT/ROLLBACK. @@ROWCOUNT ile etkilenen satır kontrolü.',
			}}
		/>
	);
}
