# 🎯 ETG Global Mülakat Hazırlık Eğitim Planı

## Hedef Profil
- 3 yıl full-stack + 2 yıl frontend deneyimi
- Dynamics 365 Finance & Supply Chain odaklı ERP/CRM danışmanlık pozisyonu
- Süre: 10 saat

---

## 📅 PLAN A: 6 Saatlik Yoğun Plan (Temel Odak)

### Saat 1-2: Dynamics 365 & Power Platform Temelleri
| Süre | Hedef | Sayfalar | Mini Uygulama |
|------|-------|----------|---------------|
| 45dk | ERP vs CRM farkı, modül haritası | `/topics/dynamics-erp-crm` | Departman-modül eşleştirme şeması çiz |
| 30dk | Power BI temel mantık | `/topics/power-bi` | Nalbur satış raporu dashboard mantığı |
| 15dk | Power Apps/Automate genel bakış | `/topics/power-apps`, `/topics/power-automate` | Hızlı göz at |

### Saat 3-4: SQL Server & Veri (ERP'nin Kalbi)
| Süre | Hedef | Sayfalar | Mini Uygulama |
|------|-------|----------|---------------|
| 60dk | Index mantığı, B-tree, seek vs scan | `/topics/sql-index` | 1M kayıt sorgusu optimize et |
| 60dk | Transaction, isolation, deadlock | `/topics/sql-transaction` | Deadlock senaryosu çöz |

### Saat 5-6: C#/.NET Core (Teknik Derinlik)
| Süre | Hedef | Sayfalar | Mini Uygulama |
|------|-------|----------|---------------|
| 40dk | async/await, thread blocking | `/topics/dotnet-async` | I/O vs CPU bound örnek |
| 40dk | DI & Lifetime'lar | `/topics/dotnet-di` | Scoped vs Singleton hata senaryosu |
| 40dk | Middleware & Error Handling | `/topics/aspnet-middleware` | Global exception handler yaz |

---

## 📅 PLAN B: 9 Saatlik Kapsamlı Plan (Tam Hazırlık)

### Saat 1-2: Dynamics 365 & İş Süreçleri
| Süre | Hedef | Sayfalar | Mini Uygulama |
|------|-------|----------|---------------|
| 60dk | ERP vs CRM, departman haritası | `/topics/dynamics-erp-crm` | Sipariş-iade akışı çiz |
| 60dk | Power Platform 4'lü ürün ailesi | `/topics/power-bi`, `/topics/power-apps` | ROI hesaplama mantığı |

### Saat 3-4: Power Platform Derinlik
| Süre | Hedef | Sayfalar | Mini Uygulama |
|------|-------|----------|---------------|
| 45dk | Power BI: DAX, veri modeli | `/topics/power-bi` | Nalbur raporu |
| 45dk | Power Apps: Canvas vs Model-driven | `/topics/power-apps` | Stok sayım formu |
| 30dk | Power Automate: Trigger/Action | `/topics/power-automate` | Stok uyarı akışı |

### Saat 5-6: SQL Server Mastery
| Süre | Hedef | Sayfalar | Mini Uygulama |
|------|-------|----------|---------------|
| 60dk | Index türleri, execution plan | `/topics/sql-index` | Sorgu analizi |
| 60dk | Transaction, isolation levels | `/topics/sql-transaction` | Deadlock çözümü |

### Saat 7-8: C#/.NET Derinlik
| Süre | Hedef | Sayfalar | Mini Uygulama |
|------|-------|----------|---------------|
| 40dk | async/await mekanizması | `/topics/dotnet-async` | Task.Run vs await |
| 40dk | DI pattern & lifetime | `/topics/dotnet-di` | Anti-pattern düzelt |
| 40dk | Middleware pipeline | `/topics/aspnet-middleware` | Custom middleware |

### Saat 9: Mimari & Son Tekrar
| Süre | Hedef | Sayfalar | Mini Uygulama |
|------|-------|----------|---------------|
| 30dk | OOP temel prensipler | `/topics/oop-basics` | Procedural → OOP |
| 30dk | SOLID refactoring | `/topics/solid-principles` | SRP/DIP uygula |

---

## 🎯 Öncelik Sıralaması (Zaman Kısıtlıysa)

### Mutlaka Bilmeli (Top 5)
1. **Dynamics 365 ERP vs CRM** - İş mantığı, departman eşleşmesi
2. **SQL Index** - 1M kayıt nasıl hızlı bulunur?
3. **async/await** - I/O bound vs CPU bound farkı
4. **DI Lifetime** - Scoped/Singleton ne zaman kullanılır?
5. **Power Platform** - 4 ürün ne işe yarar?

### Bilse İyi (Bonus)
6. Transaction/Isolation
7. Middleware/Pipeline
8. SOLID prensipler
9. OOP refactoring

---

## 📋 Her Sayfa İçin Standart Format

```
1. KONU NEDİR? (What?)
   - EN: [İngilizce tanım]
   - TR: [Türkçe tanım]

2. ETG/DYNAMICS 365 BAĞLAMI (Why here?)
   - ERP senaryosu
   - CRM senaryosu

3. ÇÖZÜMSÜZ YAKLAŞIM (Naive Way)
   - Kod örneği
   - Yaklaşım açıklaması
   - Neden zor/riskli?

4. PROBLEMLER (Pain Points)
   - Problem 1
   - Problem 2
   - Problem 3

5. ÇÖZÜMLÜ YAKLAŞIM (Better Way)
   - Kod örneği
   - Yaklaşım açıklaması
   - Neden kolaylaştı?

6. KARŞILAŞTIRMA TABLOSU
   | Kriter | Öncesi | Sonrası |
   |--------|--------|---------|

7. MÜLAKAT SORULARI (5 soru + cevap)
   - Q1: ...
   - A1: ...

8. MİNİ ÖDEV (10 dakika)
```

---

## 🚀 Sayfa Listesi ve Route'lar

| # | Konu | Route | Öncelik |
|---|------|-------|---------|
| 1 | Dynamics 365: ERP vs CRM | `/topics/dynamics-erp-crm` | ⭐⭐⭐ |
| 2 | Power BI | `/topics/power-bi` | ⭐⭐⭐ |
| 3 | Power Apps | `/topics/power-apps` | ⭐⭐ |
| 4 | Power Automate | `/topics/power-automate` | ⭐⭐ |
| 5 | Power Pages | `/topics/power-pages` | ⭐ |
| 6 | SQL: Index & Performans | `/topics/sql-index` | ⭐⭐⭐ |
| 7 | SQL: Transaction & Isolation | `/topics/sql-transaction` | ⭐⭐ |
| 8 | C#: async/await | `/topics/dotnet-async` | ⭐⭐⭐ |
| 9 | ASP.NET: Middleware | `/topics/aspnet-middleware` | ⭐⭐ |
| 10 | C#: Dependency Injection | `/topics/dotnet-di` | ⭐⭐⭐ |
| 11 | OOP: Procedural → OOP | `/topics/oop-basics` | ⭐⭐ |
| 12 | SOLID Principles | `/topics/solid-principles` | ⭐⭐ |

---

## ⏰ Mülakat Günü Checklist

- [ ] Her konunun "10-20 saniyelik cevabını" ezberle
- [ ] "Neden Dynamics 365?" sorusuna hazır ol
- [ ] "Zor bir teknik problem çözdün mü?" hikayesi hazırla
- [ ] ERP/CRM departman haritasını kafanda canlandır
- [ ] async/await ve DI lifetime soruları için hazır ol

---

*Son güncelleme: Mülakat öncesi 10 saat*
