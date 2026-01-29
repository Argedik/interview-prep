ROLE: Sen dünyada öğrenciye en etkili eğitim veren hocasın. Ben 3 yıllık full-stack + 2 yıl frontend deneyimine sahibim. Yaklaşık 10 saat sonra ETG Global’de (Microsoft Dynamics 365 Finance & Supply Chain odaklı ERP/CRM danışmanlık/çözüm ortağı) mülakata gireceğim. Amacım: Mülakatta sorulabilecek temel teknolojilerin “mantığını” 1 günde kavrayıp net konuşmak.

GÖREV: Bana “çok küçük” ama öğretici bir proje üret:

- Her konu ayrı bir “sayfa” olacak (web arayüzü olsun).
- Her sayfada aynı format zorunlu:
  (1) Konu nedir? (EN/TR kısa tanım)
  (2) ETG/Dynamics 365 bağlamında en çok nerede işe yarar? (ERP/CRM senaryosu)
  (3) ÇÖZÜM OLMADAN (naive) nasıl yapılır? → kod + yaklaşım + neden zor/riski yüksek
  (4) Bu yaklaşımın doğurduğu problemler (en az 3 madde, somut)
  (5) ÇÖZÜMLE nasıl yapılır? → kod + yaklaşım + neden kolaylaştı
  (6) “Önce/sonra” karşılaştırması: zaman/karmaşıklık/maintainability/güvenlik (kısa tablo)
  (7) Mülakat soruları: 5 zorlayıcı soru + “ikna edici kısa cevap” (EN/TR), 1-2 tuzak/pitfall
  (8) Mini ödev: 10 dakikada yapılacak küçük görev

ÖNEMLİ: Her konuda önce “çözümsüz” yaklaşımı göster, sonra çözümü uygulayıp refactor ederek iyileştirmeyi görünür yap. Her sayfa pratik olmalı, gereksiz teori yok.

PROJE TEKNİK İSTEĞİ:

- Tek repo üret.
- “Sayfa sayfa” öğrenme için basit bir web UI: Next.js (App Router) veya benzeri hafif bir docs-site.
- Her konu sayfasında: açıklama + ilgili kod snippetleri + mümkünse küçük çalıştırılabilir demo komutu.
- C#/.NET ve SQL Server mantığını göstermek için küçük örnekler ekle (kodu çalıştırmak zorunda değilsen bile “run” talimatı koy).
- Kodlar minimal CRM ERP ve DMS ile ilgili olmalı; amaç mantık öğretmek.

KONU KAPSAMI (yarın sorulabilecek teknoloji/soru alanları):
A) Dynamics 365 / ERP-CRM Temelleri (iş süreçleri + modül mantığı)

- ERP süreçleri: Finance, Procurement, Inventory/Warehouse, Logistics/Shipping, Manufacturing/Planning, HR (HR opsiyonel)
- CRM süreçleri: Marketing, Sales, Sales Operations/Pre-Sales, Customer Service/Call Center, Field Service
- “Satış sonrası” ayrımı: destek (CRM) vs iade/değişim/finans-stok (ERP) net anlat
  B) Power Platform ürünleri (Power BI / Power Apps / Power Automate / Power Pages)
- Neden ayrılmış? Hangi problem için hangisi?
- Nalbur örneği: niye para verilir? ROI mantığı: zaman tasarrufu, hata azaltma, raporlama
  C) C#/.NET (mülakat klasiği)
- async/await (I/O bound vs CPU bound) + thread blocking
- DI (Dependency Injection) + lifetime’lar (Transient/Scoped/Singleton)
- ASP.NET Core pipeline + middleware + logging
- AuthN/AuthZ: JWT, role/claim, basic OWASP mantığı
- Exception handling + global error handling
  D) SQL Server & Veri (ERP için kritik)
- 1 milyon kayıtta “en hızlı bulma” mantığı: index/B-tree, seek vs scan, hash map analojisi
- Index türleri: clustered/nonclustered, composite, covering index
- Execution plan mantığı (basit)
- Transaction & isolation (deadlock mantığı, optimistic/pessimistic)
- Pagination, filtering, sorting (performans bakışı)
  E) Mimari & Tasarım
- SOLID ve OOP ayrı çalışma olsun (karar: Önce OOP temel, sonra SOLID refactor)
- OOP olmadan “procedural/dağınık” kod yaz → büyüdükçe patlayan problemleri göster
- Sonra OOP ile sınıflara ayır → sonra SOLID ile (SRP, OCP, LSP, ISP, DIP) refactor et
- Basit design pattern’ler: Factory, Strategy (en az 1’er sayfa)
  F) Frontend (full-stack diyeceğim için)
- TypeScript temel: type narrowing, generics
- UI state yönetimi: local vs global, react query gibi server-state mantığı (framework bağımsız)
- Performans: render, memoization mantığı, network minimizasyonu
  G) Danışmanlık / Kurumsal proje gerçekleri
- Requirement ambiguity, scope, change request
- Rollout/upgrade mantığı, test stratejisi, UAT
- Stakeholder yönetimi: “problem çözme yaklaşımı” soruları

ÇIKTI 1: 5–10 Saatlik Hızlandırılmış Eğitim Planı

- Saat saat blok plan yap (örn. 6 saatlik ve 9 saatlik iki alternatif plan)
- Her blok: hedef + okunacak sayfalar + 1 mini uygulama

ÇIKTI 2: Proje Yapısı

- Repo ağaç yapısı (klasörler)
- Her konu sayfasının route’u (örn. /topics/sql-index, /topics/dotnet-async ...)
- Her sayfanın içerik başlıkları (standart şablonla)

ÇIKTI 3: Konu Sayfaları (Minimum 12 sayfa)
Zorunlu sayfalar:

1. Dynamics 365: ERP vs CRM (departman/süreç haritası + örnek)
2. Power BI (nalbur satış/kar raporu) — çözümsüz vs çözüm
3. Power Apps (stok sayım mini app) — çözümsüz vs çözüm
4. Power Automate (stok alt-limit uyarı akışı) — çözümsüz vs çözüm
5. Power Pages (müşteri portalı formu) — çözümsüz vs çözüm
6. SQL: 1M kayıt “en hızlı bulma” + index
7. SQL: transaction/isolation + deadlock senaryosu
8. C#: async/await + blocking sorun
9. ASP.NET Core: middleware + global error handling
10. DI: lifetimes + anti-pattern
11. OOP: procedural → OOP refactor
12. SOLID: OOP kodu → SOLID refactor (SRP/OCP/DIP örnekleri)

EK: Her sayfanın sonunda “mülakat mini cevapları” olsun (10-20 saniyelik cevap).

DİL: Tüm içerik Türkçe olsun. Terimlerin İngilizcesini parantezle ver.
ÜSLUP: Çok net, kısa, örnek odaklı. Gereksiz laf yok. “Neden önemli?” kısmında 1-2 cümle.

KURALLAR:

- Bilmediğin ETG’ye özel bilgi varsa uydurma; “genel Dynamics 365 partner pratikleri” diye belirt.
- Kodlar minimal ve öğretici olsun.
- Her sayfada önce kötü/naive, sonra iyi/pratik çözüm.

ŞİMDİ BAŞLA:
Önce eğitim planını üret, sonra repo yapısını ve sayfa listesini ver, sonra sayfa şablonunu oluştur ve en az 3 sayfanın içeriğini (tam) yaz; kalan sayfalar için içerik iskeleti + kod dosyalarını üret.
