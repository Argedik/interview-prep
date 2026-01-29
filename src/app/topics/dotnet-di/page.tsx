import { TopicPage } from '@/components/TopicPage';

export default function DotnetDiPage() {
	return (
		<TopicPage
			title="C#: Dependency Injection"
			titleEn="Dependency Injection and IoC Container in ASP.NET Core"
			description="Dependency Injection (DI), bağımlılıkları dışarıdan enjekte etme prensibi. Sınıf kendi bağımlılığını yaratmaz, dışarıdan alır. ASP.NET Core'da built-in IoC container var. Test edilebilirlik, gevşek bağlılık (loose coupling), değiştirilebilirlik sağlar."
			descriptionEn="Dependency Injection (DI) is the principle of injecting dependencies from outside. A class doesn't create its dependencies, receives them. ASP.NET Core has built-in IoC container. Enables testability, loose coupling, and flexibility."
			context={{
				erp: "Dynamics 365 entegrasyonu: IErpService interface'i ile gerçek API vs mock servis değiştirilebilir. Test'te mock, production'da gerçek servis.",
				crm: "Email servisi: IEmailService ile SendGrid, SMTP, ya da test mock'u kullanılabilir. Kod değişmeden provider değişir.",
			}}
			naiveApproach={{
				explanation:
					'Sınıf kendi bağımlılığını new ile yaratır. Sıkı bağlılık (tight coupling) oluşur. Test etmek için gerçek veritabanı, gerçek API gerekir. Değiştirmek için kod değişikliği gerekir.',
				code: `// ❌ YANLIŞ: new ile bağımlılık yaratma (tight coupling)

public class OrderService
{
    // ❌ Sıkı bağımlılık: OrderService SqlDatabase'e bağlı
    private readonly SqlDatabase _database;
    private readonly SmtpEmailSender _emailSender;
    private readonly StripePayment _paymentGateway;
    
    public OrderService()
    {
        // ❌ Kendisi yaratıyor, değiştirilemez
        _database = new SqlDatabase("Server=prod;Database=ERP;...");
        _emailSender = new SmtpEmailSender("smtp.gmail.com", 587);
        _paymentGateway = new StripePayment("sk_live_xxx");
    }
    
    public void CreateOrder(Order order)
    {
        // Veritabanına kaydet
        _database.Insert("Orders", order);  // ❌ Gerçek DB
        
        // Ödeme al
        _paymentGateway.Charge(order.Total);  // ❌ Gerçek ödeme!
        
        // Email gönder
        _emailSender.Send(order.CustomerEmail, "Sipariş alındı");
    }
}

// ❌ Test etmeye çalışalım:
[Test]
public void CreateOrder_ShouldWork()
{
    var service = new OrderService();  // 😱 Gerçek DB bağlantısı!
    
    var order = new Order { Total = 100, CustomerEmail = "test@test.com" };
    
    service.CreateOrder(order);  // 💸 GERÇEK ÖDEME ALINDI!
                                 // 📧 GERÇEK EMAIL GÖNDERİLDİ!
                                 // 💾 GERÇEK DB'YE YAZILDI!
}

// ❌ Problemler:
// - Test'te gerçek ödeme alındı (100 TL!)
// - Test'te gerçek email gönderildi (spam)
// - Test'te gerçek veritabanı değişti
// - Test yavaş (network bağımlı)
// - Test güvenilmez (external servisler fail edebilir)`,
				language: 'csharp',
			}}
			problems={[
				'TEST EDİLEMEZ: Gerçek veritabanı, gerçek API, gerçek ödeme gerekiyor. Unit test yazmak imkansız veya riskli.',
				'SIKI BAĞLILIK: SqlDatabase değişecekse, OrderService kodunu değiştirmek lazım. 100 yerde SqlDatabase kullanılıyorsa 100 değişiklik.',
				"KONFIGÜRASYON SORUNU: Connection string, API key kod içinde. Environment'a göre değiştirilemez.",
				'SINGLE RESPONSIBILITY İHLALİ: OrderService hem iş mantığı hem de bağımlılık yaratma sorumluluğunu taşıyor.',
				"MOCK/FAKE KULLANILAMAZ: Test'te fake database, fake email kullanamıyoruz çünkü new ile sabit yaratılıyor.",
			]}
			betterApproach={{
				explanation:
					"Interface'ler tanımlanır, bağımlılıklar constructor'dan enjekte edilir. ASP.NET Core IoC container'ı lifetime yönetir. Test'te mock, production'da gerçek implementasyon kullanılır.",
				code: `// ✅ DOĞRU: Dependency Injection ile gevşek bağlılık

// 1. Interface'ler tanımla (soyutlama)
public interface IDatabase
{
    void Insert<T>(string table, T entity);
    T GetById<T>(string table, int id);
}

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string body);
}

public interface IPaymentGateway
{
    Task<PaymentResult> ChargeAsync(decimal amount, string currency);
}

// 2. Concrete implementation'lar
public class SqlDatabase : IDatabase
{
    private readonly string _connectionString;
    
    public SqlDatabase(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }
    
    public void Insert<T>(string table, T entity) { /* SQL insert */ }
    public T GetById<T>(string table, int id) { /* SQL select */ }
}

public class SendGridEmailSender : IEmailSender
{
    public async Task SendAsync(string to, string subject, string body)
    {
        // SendGrid API call
    }
}

// 3. Service - bağımlılıklar constructor'dan alınıyor
public class OrderService : IOrderService
{
    private readonly IDatabase _database;
    private readonly IEmailSender _emailSender;
    private readonly IPaymentGateway _paymentGateway;
    
    // ✅ Constructor Injection
    public OrderService(
        IDatabase database,
        IEmailSender emailSender,
        IPaymentGateway paymentGateway)
    {
        _database = database;
        _emailSender = emailSender;
        _paymentGateway = paymentGateway;
    }
    
    public async Task CreateOrderAsync(Order order)
    {
        _database.Insert("Orders", order);
        await _paymentGateway.ChargeAsync(order.Total, "TRY");
        await _emailSender.SendAsync(order.CustomerEmail, "Sipariş", "Alındı");
    }
}

// 4. DI Container kayıt (Program.cs)
var builder = WebApplication.CreateBuilder(args);

// Lifetime seçenekleri:
builder.Services.AddScoped<IDatabase, SqlDatabase>();       // Her request'te yeni
builder.Services.AddSingleton<IEmailSender, SendGridEmailSender>(); // Tek instance
builder.Services.AddTransient<IPaymentGateway, StripePayment>();    // Her injection'da yeni

builder.Services.AddScoped<IOrderService, OrderService>();

// 5. TEST: Mock ile kolay test
[Test]
public async Task CreateOrder_ShouldChargeAndSendEmail()
{
    // Arrange - Mock'lar oluştur
    var mockDb = new Mock<IDatabase>();
    var mockEmail = new Mock<IEmailSender>();
    var mockPayment = new Mock<IPaymentGateway>();
    mockPayment.Setup(p => p.ChargeAsync(It.IsAny<decimal>(), It.IsAny<string>()))
               .ReturnsAsync(new PaymentResult { Success = true });
    
    var service = new OrderService(mockDb.Object, mockEmail.Object, mockPayment.Object);
    
    // Act
    await service.CreateOrderAsync(new Order { Total = 100, CustomerEmail = "a@b.com" });
    
    // Assert - Gerçek ödeme yok, sadece çağrıldı mı kontrol
    mockPayment.Verify(p => p.ChargeAsync(100, "TRY"), Times.Once);
    mockEmail.Verify(e => e.SendAsync("a@b.com", It.IsAny<string>(), It.IsAny<string>()), Times.Once);
}
// ✅ Test: 10ms, gerçek ödeme yok, güvenilir`,
				language: 'csharp',
			}}
			comparison={[
				{
					criteria: 'Test Edilebilirlik',
					before: 'Çok zor (gerçek servisler)',
					after: 'Kolay (mock/fake)',
				},
				{
					criteria: 'Bağımlılık',
					before: 'Sıkı (tight coupling)',
					after: 'Gevşek (loose coupling)',
				},
				{
					criteria: 'Değiştirilebilirlik',
					before: 'Kod değişikliği gerekli',
					after: "Config'den değiştir",
				},
				{
					criteria: 'Single Responsibility',
					before: 'İhlal (yaratma + iş mantığı)',
					after: 'Uygun (sadece iş mantığı)',
				},
				{
					criteria: 'Test Süresi',
					before: 'Saniyeler (network)',
					after: 'Milisaniyeler (memory)',
				},
				{
					criteria: 'Lifetime Yönetimi',
					before: 'Manuel',
					after: 'Container otomatik',
				},
			]}
			interviewQuestions={[
				{
					question: 'Transient, Scoped, Singleton farkı nedir?',
					questionEn:
						"What's the difference between Transient, Scoped, and Singleton?",
					answer:
						"Transient: Her injection'da yeni instance. Scoped: Her HTTP request'te yeni, aynı request içinde aynı. Singleton: Uygulama ömrü boyunca tek instance. DbContext → Scoped, HttpClient → Singleton.",
					answerEn:
						'Transient: New instance per injection. Scoped: New per HTTP request, same within request. Singleton: One instance for app lifetime. DbContext → Scoped, HttpClient → Singleton.',
				},
				{
					question: 'Captive Dependency (Scoped in Singleton) nedir?',
					questionEn: 'What is Captive Dependency (Scoped in Singleton)?',
					answer:
						"Singleton servis Scoped servisi inject ederse, Scoped aslında Singleton gibi davranır (hep aynı instance). DbContext'i Singleton'a inject etme! Tehlikeli bug. ValidateScopes ile tespit et.",
					answerEn:
						"If Singleton injects Scoped, the Scoped behaves like Singleton (same instance forever). Don't inject DbContext into Singleton! Dangerous bug. Use ValidateScopes to detect.",
				},
				{
					question: 'Constructor injection vs Property injection farkı?',
					questionEn: 'Difference between Constructor and Property injection?',
					answer:
						'Constructor: Zorunlu bağımlılıklar, nesne oluşturulduğunda garanti. Property: Opsiyonel bağımlılıklar, sonradan set edilebilir. Constructor tercih edilir, daha açık ve güvenli.',
					answerEn:
						'Constructor: Required dependencies, guaranteed at creation. Property: Optional dependencies, can set later. Constructor preferred, more explicit and safer.',
				},
				{
					question: 'Service Locator anti-pattern nedir?',
					questionEn: 'What is the Service Locator anti-pattern?',
					answer:
						"Bağımlılığı constructor'dan almak yerine IServiceProvider.GetService() ile almak. Bağımlılıklar gizlenir, test zorlaşır, runtime hata riski. Constructor injection kullan.",
					answerEn:
						'Getting dependencies via IServiceProvider.GetService() instead of constructor. Hides dependencies, harder to test, runtime error risk. Use constructor injection.',
				},
				{
					question: 'Keyed Services (.NET 8+) ne işe yarar?',
					questionEn: 'What are Keyed Services (.NET 8+) for?',
					answer:
						"Aynı interface'in birden fazla implementasyonunu key ile ayırt etmek. AddKeyedScoped<ICache, RedisCache>('redis'). [FromKeyedServices('redis')] ile inject et. Örnek: farklı cache provider'lar.",
					answerEn:
						"Distinguish multiple implementations of same interface by key. AddKeyedScoped<ICache, RedisCache>('redis'). Inject with [FromKeyedServices('redis')]. Example: different cache providers.",
				},
			]}
			pitfalls={[
				"TUZAK: 'Singleton içinde Scoped servis kullandım' → Captive Dependency! Scoped servis hiç dispose olmaz, memory leak + eski veri. ValidateScopes: true yap.",
				"TUZAK: 'Her yere Singleton koydum, performans için' → Yanlış! Thread-safety sorunu. State tutan servisler Scoped olmalı. DbContext kesinlikle Scoped.",
			]}
			miniTask={{
				description:
					"Basit bir INotificationService interface'i ve iki implementasyon (EmailNotification, SmsNotification) tasarlayın. Program.cs'te her ikisini de kaydedin ve bir OrderController'da kullanın. Hangisini ne zaman inject edersiniz?",
				hint: 'INotificationService tanımla. EmailNotification : INotificationService. AddScoped<INotificationService, EmailNotification>. SMS için Keyed Services veya IEnumerable<INotificationService> kullan.',
			}}
		/>
	);
}
