import { TopicPage } from '@/components/TopicPage';

export default function SqlIndexPage() {
	return (
		<TopicPage
			title="SQL: Index & Performans"
			titleEn="SQL Server Indexing and Query Performance"
			description="Index, veritabanındaki kayıtları hızlı bulmak için kullanılan veri yapısıdır. B-tree (balanced tree) yapısı sayesinde milyonlarca kayıtta bile O(log n) karmaşıklıkla arama yapılır. Kitaptaki 'içindekiler' sayfası gibi düşünün."
			descriptionEn="An index is a data structure used to quickly find records in a database. Thanks to B-tree structure, it searches with O(log n) complexity even in millions of records. Think of it like a book's table of contents."
			context={{
				erp: "Dynamics 365 Finance'te 1 milyon fatura kaydı var. 'Son 30 gündeki vadesi geçmiş faturaları listele' sorgusu index olmadan dakikalar sürer, index ile milisaniyeler.",
				crm: 'Müşteri arama: 500.000 müşteri içinden telefon numarasıyla arama. Index olmadan full table scan, index ile anında sonuç.',
			}}
			naiveApproach={{
				explanation:
					'Index tanımlamadan doğrudan sorgu yazılır. Veritabanı tüm tabloyu baştan sona tarar (Table Scan). 1 milyon kayıtta her sorgu için 1 milyon satır okunur.',
				code: `-- ❌ YANLIŞ: Index olmadan sorgu

-- Tablo: 1.000.000 fatura kaydı
CREATE TABLE Invoices (
    InvoiceId INT PRIMARY KEY,  -- Clustered index (otomatik)
    CustomerId INT,
    InvoiceDate DATE,
    DueDate DATE,
    Amount DECIMAL(18,2),
    Status VARCHAR(20)
);

-- Sorgu: Vadesi geçmiş faturaları bul
SELECT CustomerId, InvoiceId, Amount, DueDate
FROM Invoices
WHERE DueDate < '2026-01-01' 
  AND Status = 'Unpaid';

-- ❌ Execution Plan:
-- Table Scan (Clustered Index Scan)
-- Estimated Rows: 1,000,000
-- Actual Rows Read: 1,000,000  ← TÜM TABLO OKUNDU!
-- Duration: 15 saniye

-- 📊 Neden yavaş?
-- DueDate ve Status sütunlarında index yok
-- Veritabanı her satırı tek tek kontrol etmek zorunda
-- Disk I/O çok yüksek`,
				language: 'sql',
			}}
			problems={[
				'PERFORMANS: Her sorguda tüm tablo taranıyor. 1M kayıtta 15 saniye, 10M kayıtta 2.5 dakika. Kullanıcı bekliyor!',
				'KAYNAK TÜKETİMİ: CPU ve Disk I/O sürekli yüksek. Diğer sorgular da yavaşlıyor. Sunucu zorlanıyor.',
				'ÖLÇEKLENEMİYOR: Veri büyüdükçe lineer yavaşlıyor. 2 kat veri = 2 kat yavaş sorgu. Kabul edilemez!',
				'KİLİTLENME RİSKİ: Uzun süren sorgular kilit tutuyor. Diğer işlemler bloklanıyor. Deadlock riski artıyor.',
				'RAPOR TIMEOUT: Power BI veya raporlama araçları timeout alıyor. Kullanıcılar rapor alamıyor.',
			]}
			betterApproach={{
				explanation:
					"Sorgu pattern'ına uygun Non-Clustered Index tanımlanır. B-tree yapısı sayesinde 1M kayıtta bile 3-4 seviye derinlikte (log₂(1M) ≈ 20) sonuca ulaşılır. Covering Index ile tüm sütunlar index'ten okunur, tabloya gidilmez.",
				code: `-- ✅ DOĞRU: Uygun index tasarımı

-- 1. Filtreleme sütunlarına Non-Clustered Index
CREATE NONCLUSTERED INDEX IX_Invoices_DueDate_Status
ON Invoices (DueDate, Status)  -- Filtreleme sütunları
INCLUDE (CustomerId, Amount);  -- SELECT'teki diğer sütunlar (Covering)

-- Aynı sorgu:
SELECT CustomerId, InvoiceId, Amount, DueDate
FROM Invoices
WHERE DueDate < '2026-01-01' 
  AND Status = 'Unpaid';

-- ✅ Execution Plan:
-- Index Seek (NonClustered)  ← SEEK! Scan değil!
-- Estimated Rows: 50,000
-- Actual Rows Read: 50,000   ← Sadece eşleşenler okundu
-- Duration: 50 milisaniye    ← 300x hızlandı!

-- 📊 Neden hızlı?
-- B-tree ile doğrudan DueDate < '2026-01-01' aralığına gidildi
-- Status = 'Unpaid' filtresi index'te uygulandı
-- INCLUDE sütunları sayesinde Key Lookup yapılmadı

-- 2. Composite Index Sırası ÖNEMLİ!
-- ✅ DOĞRU: Önce eşitlik, sonra aralık
CREATE INDEX IX_Good ON Invoices (Status, DueDate);
-- Status = 'Unpaid' → eşitlik, tam eşleşme
-- DueDate < '2026-01-01' → aralık

-- ❌ YANLIŞ: Önce aralık, sonra eşitlik
CREATE INDEX IX_Bad ON Invoices (DueDate, Status);
-- DueDate aralığı belirlendikten sonra Status kullanılamaz

-- 3. Index kullanımını kontrol et
SET STATISTICS IO ON;
-- Logical reads: 150 (index ile) vs 15000 (scan ile)`,
				language: 'sql',
			}}
			comparison={[
				{
					criteria: 'Sorgu Süresi',
					before: '15 saniye',
					after: '50 milisaniye',
				},
				{
					criteria: 'Okunan Satır',
					before: '1,000,000 (tüm tablo)',
					after: '50,000 (sadece eşleşenler)',
				},
				{
					criteria: 'Execution Plan',
					before: 'Table/Index Scan',
					after: 'Index Seek',
				},
				{
					criteria: 'CPU Kullanımı',
					before: 'Yüksek',
					after: 'Düşük',
				},
				{
					criteria: 'Ölçeklenebilirlik',
					before: 'O(n) - lineer',
					after: 'O(log n) - logaritmik',
				},
				{
					criteria: 'Eş Zamanlı Kullanıcı',
					before: 'Az (bloklanma)',
					after: 'Çok (hızlı sorgular)',
				},
			]}
			interviewQuestions={[
				{
					question: 'Clustered ve Non-Clustered Index farkı nedir?',
					questionEn:
						"What's the difference between Clustered and Non-Clustered Index?",
					answer:
						'Clustered: Tablodaki verilerin fiziksel sırasını belirler, tablo başına 1 tane. Genelde Primary Key. Non-Clustered: Ayrı bir yapı, asıl veriye pointer tutar, tablo başına birden fazla olabilir.',
					answerEn:
						'Clustered: Determines physical order of data, 1 per table, usually PK. Non-Clustered: Separate structure with pointers to data, multiple per table allowed.',
				},
				{
					question: 'Index Seek ve Index Scan farkı nedir?',
					questionEn:
						"What's the difference between Index Seek and Index Scan?",
					answer:
						"Seek: B-tree'de doğrudan hedef satırlara gider, çok hızlı. Scan: Tüm index'i baştan sona okur, yavaş. WHERE koşulu index'in ilk sütunuyla başlamalı ki Seek olsun.",
					answerEn:
						'Seek: Goes directly to target rows via B-tree, very fast. Scan: Reads entire index, slow. WHERE clause must start with first column of index for Seek.',
				},
				{
					question: 'Covering Index nedir ve ne zaman kullanılır?',
					questionEn: 'What is a Covering Index and when to use it?',
					answer:
						"SELECT'teki tüm sütunlar index'te bulunursa, tabloya gidilmez (Key Lookup yok). INCLUDE ile eklenir. Çok sık çalışan sorgularda büyük performans kazancı sağlar.",
					answerEn:
						'When all columns in SELECT are in index, no Key Lookup needed. Added via INCLUDE. Provides huge performance gain for frequently run queries.',
				},
				{
					question: "Composite Index'te sütun sırası neden önemli?",
					questionEn: 'Why does column order matter in Composite Index?',
					answer:
						"Index soldan sağa kullanılır. WHERE'deki ilk sütun index'in ilk sütunu olmalı. Eşitlik (=) sütunları önce, aralık (<, >) sütunları sonra gelmeli.",
					answerEn:
						'Index is used left to right. First column in WHERE must be first in index. Equality (=) columns first, range (<, >) columns last.',
				},
				{
					question: 'Index her zaman iyi mi? Dezavantajı var mı?',
					questionEn: 'Is index always good? Any disadvantages?',
					answer:
						"Hayır. Index INSERT/UPDATE/DELETE'i yavaşlatır (index de güncellenmeli). Disk alanı kaplar. Çok index = çok bakım. OLTP'de dikkatli ol, OLAP'ta rahat ol.",
					answerEn:
						'No. Index slows INSERT/UPDATE/DELETE (index must update too). Consumes disk space. Many indexes = more maintenance. Be careful in OLTP, relaxed in OLAP.',
				},
			]}
			pitfalls={[
				"TUZAK: 'Her sütuna index koyalım' → Yanlış! INSERT/UPDATE yavaşlar, disk şişer. Sadece WHERE/JOIN/ORDER BY'daki sütunlara.",
				"TUZAK: 'Index var ama Seek olmuyor' → WHERE'de fonksiyon kullanma! WHERE YEAR(Date) = 2026 yerine WHERE Date >= '2026-01-01'.",
			]}
			miniTask={{
				description:
					"Aşağıdaki sorgu için en uygun index'i tasarlayın: SELECT ProductName, TotalSold FROM Products WHERE CategoryId = 5 AND Price > 100 ORDER BY TotalSold DESC; Tablo: Products (ProductId PK, ProductName, CategoryId, Price, TotalSold, CreatedDate)",
				hint: 'CategoryId eşitlik, Price aralık → (CategoryId, Price). SELECT sütunları için INCLUDE. ORDER BY için index sırası.',
			}}
		/>
	);
}
