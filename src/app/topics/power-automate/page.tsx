import { TopicPage } from "@/components/TopicPage";

export default function PowerAutomatePage() {
  return (
    <TopicPage
      title="Power Automate"
      titleEn="Workflow Automation and Integration Platform"
      description="Power Automate (eski adı Microsoft Flow), iş süreçlerini otomatikleştiren low-code platform. Trigger → Condition → Action yapısı. 500+ connector ile sistemler arası entegrasyon. Tekrarlayan manuel işleri otomatik yap, insan hatasını azalt."
      descriptionEn="Power Automate (formerly Microsoft Flow) is a low-code platform for automating business processes. Trigger → Condition → Action structure. 500+ connectors for system integration. Automate repetitive manual tasks, reduce human error."
      context={{
        erp: "Stok alt limitin altına düştüğünde otomatik uyarı email'i ve satınalma talebi oluşturma. Manuel takip yerine sistem tetikliyor.",
        crm: "Yeni müşteri adayı (Lead) geldiğinde satış temsilcisine atama, hoşgeldin email'i gönderme, takip görevi oluşturma.",
      }}
      naiveApproach={{
        explanation:
          "Stok seviyesi manuel kontrol edilir. Birileri her gün Excel'e bakıp 'stok azalmış, alım yapalım' diyor. Unutuluyor, geç kalınıyor, stoksuz kalınıyor.",
        code: `# ❌ YANLIŞ: Manuel stok takibi

## Senaryo: Nalbur dükkanı stok kontrolü

### Manuel Süreç (Her gün tekrar)
1. Sabah Excel'i aç (stok_takip.xlsx)
2. Her satırı kontrol et:
   "Çivi stok 50 kg → alt limit 100 kg → SİPARİŞ VER!"
3. Email yaz:
   "Merhaba tedarikçi, 200 kg çivi gönderin..."
4. Satınalma siparişi oluştur (ERP'ye manuel gir)
5. Takip için not al (Post-it'e yaz)

### Haftada 3 kez unutuluyor:
- Pazartesi: Yoğunluktan kontrol yapılamadı
- Çarşamba: Excel'i açtı ama satınalmaya geçmedi
- Cuma: "Aa çivi bitti!" - Müşteri eli boş döndü

# ❌ Problemler:
# - İnsan bağımlı, unutma riski
# - Gecikmeli tepki (günlük kontrol)
# - Standart yok (kim neyi ne zaman?)
# - İzlenebilirlik yok
# - Çoklu ürün = kaos`,
        language: "markdown",
      }}
      problems={[
        "UNUTMA RİSKİ: İnsan unutur, hastalık, izin, yoğunluk. Stok biter, müşteri kaybedilir.",
        "GECİKME: Günlük kontrol = 24 saat gecikme. Stok bugün bitti, yarın fark edildi.",
        "STANDART YOK: Herkes farklı yapıyor. Kim hangi tedarikçiye ne zaman sipariş veriyor? Kaos.",
        "İZLENEBİLİRLİK YOK: Sipariş verildi mi, takip ediliyor mu, teslim alındı mı? Audit trail yok.",
        "ÖLÇEKLENEMİYOR: 10 ürün okay, 1000 ürün impossible. Her ürünü manuel takip etmek imkansız.",
      ]}
      betterApproach={{
        explanation:
          "Power Automate ile otomatik akış: Stok değiştiğinde trigger → koşul kontrolü → uyarı email'i + satınalma talebi oluşturma. 7/24 çalışır, unutmaz, anında tepki verir.",
        code: `// ✅ DOĞRU: Power Automate ile otomatik stok uyarısı

// Akış Adı: "Stok-Alt-Limit-Uyari"

// 1. TRIGGER: Stok değişikliği
// When a row is modified (Dataverse: Products table)
trigger: {
    type: "Dataverse",
    table: "Products",
    event: "Modified",
    filter: "OnHandQuantity changed"
}

// 2. CONDITION: Alt limit kontrolü
condition: {
    if: "OnHandQuantity < ReorderPoint",
    // ReorderPoint = Yeniden sipariş noktası (örn: 100 kg)
    then: "continue",
    else: "terminate"
}

// 3. ACTION 1: Uyarı Email'i gönder
action_email: {
    to: "satin.alma@nalbur.com; depo@nalbur.com",
    subject: "⚠️ Stok Uyarısı: @{triggerBody()?['ProductName']}",
    body: "Ürün: @{triggerBody()?['ProductName']}\\n" +
          "Mevcut Stok: @{triggerBody()?['OnHandQuantity']} @{triggerBody()?['Unit']}\\n" +
          "Alt Limit: @{triggerBody()?['ReorderPoint']} @{triggerBody()?['Unit']}\\n" +
          "Önerilen Sipariş: @{triggerBody()?['ReorderQuantity']} @{triggerBody()?['Unit']}\\n" +
          "Tedarikçi: @{triggerBody()?['PreferredVendor']}\\n\\n" +
          "⚡ Otomatik satınalma talebi oluşturuldu."
}

// 4. ACTION 2: Satınalma talebi oluştur (Dynamics 365)
action_purchase_req: {
    connector: "Dynamics 365 Supply Chain",
    action: "Create Purchase Requisition",
    data: {
        ProductId: "@{triggerBody()?['ProductId']}",
        Quantity: "@{triggerBody()?['ReorderQuantity']}",
        VendorId: "@{triggerBody()?['PreferredVendorId']}",
        RequestedDate: "@{addDays(utcNow(), 3)}",  // 3 gün sonra
        Requester: "PowerAutomate-StokUyari",
        Priority: "High"
    }
}

// 5. ACTION 3: Teams'e bildirim (opsiyonel)
action_teams: {
    connector: "Microsoft Teams",
    action: "Post message to channel",
    channel: "Satınalma",
    message: "🔔 @{triggerBody()?['ProductName']} için otomatik satınalma talebi oluşturuldu."
}

// ✅ Sonuç:
// - 7/24 otomatik takip
// - Anında tepki (dakikalar içinde)
// - Standart süreç
// - Tam izlenebilirlik (run history)
// - 1000 ürün için de çalışır`,
        language: "javascript",
      }}
      comparison={[
        {
          criteria: "Tetikleme Zamanı",
          before: "Günlük manuel kontrol",
          after: "Anında (event-driven)",
        },
        {
          criteria: "Unutma Riski",
          before: "Yüksek",
          after: "Sıfır (otomatik)",
        },
        {
          criteria: "Tepki Süresi",
          before: "24+ saat",
          after: "Dakikalar",
        },
        {
          criteria: "Tutarlılık",
          before: "Kişiye bağlı",
          after: "Her zaman aynı",
        },
        {
          criteria: "İzlenebilirlik",
          before: "Yok",
          after: "Tam (run history)",
        },
        {
          criteria: "Ölçeklenme",
          before: "10 ürün maks",
          after: "Sınırsız",
        },
      ]}
      interviewQuestions={[
        {
          question: "Power Automate'te Trigger türleri nelerdir?",
          questionEn: "What are the Trigger types in Power Automate?",
          answer:
            "Automated (event-driven: email geldi, satır eklendi), Scheduled (zamanlı: her gün 9:00), Instant (manuel: butona tıkla). Automated en yaygın, gerçek otomasyon için.",
          answerEn:
            "Automated (event-driven: email arrived, row added), Scheduled (time-based: daily 9am), Instant (manual: button click). Automated most common for real automation.",
        },
        {
          question: "Cloud flow vs Desktop flow farkı?",
          questionEn: "Difference between Cloud flow and Desktop flow?",
          answer:
            "Cloud: Bulutta çalışır, API-based connector'lar, SaaS entegrasyonu. Desktop (RPA): Bilgisayarda çalışır, UI otomasyonu, legacy sistem için. Hybrid de mümkün.",
          answerEn:
            "Cloud: Runs in cloud, API-based connectors, SaaS integration. Desktop (RPA): Runs on computer, UI automation, for legacy systems. Hybrid also possible.",
        },
        {
          question: "Power Automate'te hata yönetimi nasıl yapılır?",
          questionEn: "How is error handling done in Power Automate?",
          answer:
            "'Configure run after' ile hata durumunda farklı branch. Scope + Try-Catch pattern. Terminate action ile akışı durdur. Email/Teams ile hata bildirimi.",
          answerEn:
            "'Configure run after' for error branches. Scope + Try-Catch pattern. Terminate action to stop flow. Email/Teams for error notification.",
        },
        {
          question: "Premium connector ne demek?",
          questionEn: "What does Premium connector mean?",
          answer:
            "Ek lisans gerektiren connector'lar: SQL Server, HTTP, Custom connector, Dataverse (bazı senaryolar). Seeded vs standalone lisans farkı da var.",
          answerEn:
            "Connectors requiring extra license: SQL Server, HTTP, Custom connector, Dataverse (some scenarios). Also seeded vs standalone license difference.",
        },
        {
          question: "Power Automate performans limitleri nelerdir?",
          questionEn: "What are Power Automate performance limits?",
          answer:
            "Günlük akış çalıştırma limiti, action başına timeout (varsayılan 30 sn), paralel branch limiti, nested loop derinliği. Enterprise için plan yükseltmesi gerekebilir.",
          answerEn:
            "Daily flow run limits, per-action timeout (default 30s), parallel branch limits, nested loop depth. May need plan upgrade for enterprise.",
        },
      ]}
      pitfalls={[
        "TUZAK: 'Her şeyi Power Automate ile yap' → Yanlış! Saniyede 1000 işlem gerekiyorsa kod yaz. Power Automate iş süreci için, yüksek hacim için değil.",
        "TUZAK: 'Loop içinde loop kullandım, çalışmıyor' → Performance killer! Apply to each içinde Apply to each = N² complexity. Batch işlem veya parallel branch kullan.",
      ]}
      miniTask={{
        description:
          "Basit bir 'Stok Alt Limit Uyarısı' akışı tasarlayın: 1) Ürün tablosunda güncelleme trigger, 2) OnHandQty < ReorderPoint koşulu, 3) Email gönder, 4) Teams'e post at. Hangi connector ve action'lar kullanırsınız?",
        hint: "Dataverse connector → Condition action → Office 365 Outlook (Send email) → Microsoft Teams (Post message). Expression: triggerBody()?['OnHandQuantity']",
      }}
    />
  );
}
