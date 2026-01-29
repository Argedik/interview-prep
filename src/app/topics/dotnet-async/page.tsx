import { TopicPage } from '@/components/TopicPage';

export default function DotnetAsyncPage() {
	return (
		<TopicPage
			title="C#: async/await"
			titleEn="Asynchronous Programming in C# with async/await"
			description="async/await, I/O işlemleri sırasında thread'i bloklamadan bekletir. Thread havuzu verimli kullanılır, daha fazla eşzamanlı istek işlenebilir. Özellikle web uygulamalarında kritik: veritabanı sorgusu, API çağrısı, dosya okuma."
			descriptionEn="async/await allows waiting for I/O operations without blocking threads. Thread pool is used efficiently, more concurrent requests can be handled. Critical for web apps: database queries, API calls, file operations."
			context={{
				erp: 'Dynamics 365 API entegrasyonu: Fatura listesi çekerken thread bloklanırsa, 100 kullanıcı aynı anda istek atınca sunucu kilitlenir. async ile thread serbest bırakılır.',
				crm: "Power Automate connector: Harici CRM'den müşteri verisi çekerken 5 saniye bekleniyor. async olmadan 5 saniye boyunca thread meşgul, diğer istekler bekler.",
			}}
			naiveApproach={{
				explanation:
					'Senkron (blocking) kod yazılır. Thread, I/O işlemi tamamlanana kadar bekler ve hiçbir iş yapamaz. Web sunucusunda thread havuzu tükenir, yeni istekler işlenemez.',
				code: `// ❌ YANLIŞ: Senkron (blocking) yaklaşım

public class InvoiceService
{
    private readonly HttpClient _httpClient;
    
    // ❌ Senkron metot - Thread bloklanıyor
    public List<Invoice> GetInvoicesFromErp(string customerId)
    {
        // ⚠️ Thread burada 2-3 saniye bekliyor, hiçbir iş yapamıyor!
        var response = _httpClient.GetAsync($"/api/invoices?customer={customerId}")
                                  .Result;  // ❌ .Result veya .Wait() BLOKLAR!
        
        var json = response.Content.ReadAsStringAsync().Result;  // ❌ Yine blok!
        
        return JsonSerializer.Deserialize<List<Invoice>>(json);
    }
    
    // ❌ Veritabanı sorgusu - senkron
    public Invoice GetInvoiceById(int id)
    {
        using var connection = new SqlConnection(connectionString);
        connection.Open();  // ❌ Senkron bağlantı açma
        
        using var command = new SqlCommand("SELECT * FROM Invoices WHERE Id = @id", connection);
        command.Parameters.AddWithValue("@id", id);
        
        using var reader = command.ExecuteReader();  // ❌ Senkron okuma
        // Thread burada bekliyor...
        
        if (reader.Read())
        {
            return new Invoice { 
                Id = reader.GetInt32(0),
                Amount = reader.GetDecimal(1)
            };
        }
        return null;
    }
}

// ❌ Controller'da kullanım
[HttpGet]
public IActionResult GetInvoices(string customerId)
{
    // ⚠️ Bu endpoint'e 100 istek gelirse:
    // - 100 thread bloklanır
    // - Thread pool tükenir (varsayılan ~20-50 thread)
    // - Yeni istekler kuyrukta bekler
    // - Timeout, 503 hatası
    
    var invoices = _invoiceService.GetInvoicesFromErp(customerId);
    return Ok(invoices);
}`,
				language: 'csharp',
			}}
			problems={[
				'THREAD AÇLIĞI (Thread Starvation): 100 eşzamanlı istek = 100 bekleyen thread. Thread pool tükenir, sunucu yeni istek alamaz. Timeout, 503 hatası.',
				'KAYNAK İSRAFI: Thread beklerken hiçbir iş yapmıyor ama bellek tüketiyor. Her thread ~1MB stack. 100 thread = 100MB boşa bellek.',
				'ÖLÇEKLENEMİYOR: Senkron kod ile sunucu kapasitesi thread sayısıyla sınırlı. 50 thread = max 50 eşzamanlı I/O. async ile binlerce olabilir.',
				"DEADLOCK RİSKİ: ASP.NET'te .Result veya .Wait() kullanmak deadlock'a yol açabilir. UI thread bloklanır, async continuation çalışamaz.",
				"PERFORMANS: Senkron API çağrıları seri çalışır. 3 API'yi sırayla çağırmak = toplam süre. async ile paralel = en uzun süre.",
			]}
			betterApproach={{
				explanation:
					'async/await kullanılır. Thread I/O beklerken serbest bırakılır, başka isteklere hizmet verir. I/O tamamlanınca (completion callback) işlem devam eder. Çok daha az thread ile çok daha fazla eşzamanlı istek.',
				code: `// ✅ DOĞRU: async/await ile non-blocking yaklaşım

public class InvoiceService
{
    private readonly HttpClient _httpClient;
    
    // ✅ Async metot - Thread serbest bırakılıyor
    public async Task<List<Invoice>> GetInvoicesFromErpAsync(string customerId)
    {
        // ✅ await: Thread serbest, başka isteklere hizmet edebilir
        var response = await _httpClient.GetAsync($"/api/invoices?customer={customerId}");
        
        // ✅ İşlem tamamlanınca devam ediyor (farklı thread olabilir)
        var json = await response.Content.ReadAsStringAsync();
        
        return JsonSerializer.Deserialize<List<Invoice>>(json);
    }
    
    // ✅ Veritabanı sorgusu - async
    public async Task<Invoice> GetInvoiceByIdAsync(int id)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();  // ✅ Async bağlantı
        
        await using var command = new SqlCommand(
            "SELECT * FROM Invoices WHERE Id = @id", connection);
        command.Parameters.AddWithValue("@id", id);
        
        await using var reader = await command.ExecuteReaderAsync();  // ✅ Async okuma
        
        if (await reader.ReadAsync())
        {
            return new Invoice { 
                Id = reader.GetInt32(0),
                Amount = reader.GetDecimal(1)
            };
        }
        return null;
    }
    
    // ✅ Paralel async çağrılar
    public async Task<DashboardData> GetDashboardAsync(string customerId)
    {
        // 3 API'yi paralel çağır - en uzun süren kadar bekle
        var invoicesTask = GetInvoicesFromErpAsync(customerId);
        var ordersTask = GetOrdersAsync(customerId);
        var paymentsTask = GetPaymentsAsync(customerId);
        
        // ✅ Hepsi paralel çalışıyor
        await Task.WhenAll(invoicesTask, ordersTask, paymentsTask);
        
        return new DashboardData {
            Invoices = await invoicesTask,   // Zaten tamamlandı, hemen döner
            Orders = await ordersTask,
            Payments = await paymentsTask
        };
    }
}

// ✅ Controller'da kullanım
[HttpGet]
public async Task<IActionResult> GetInvoices(string customerId)
{
    // ✅ Bu endpoint'e 1000 istek gelse bile:
    // - Thread beklemez, serbest bırakılır
    // - Çok az thread ile çok istek işlenir
    // - Sunucu responsive kalır
    
    var invoices = await _invoiceService.GetInvoicesFromErpAsync(customerId);
    return Ok(invoices);
}`,
				language: 'csharp',
			}}
			comparison={[
				{
					criteria: '100 Eşzamanlı İstek',
					before: '100 thread bloklanır',
					after: 'Birkaç thread yeterli',
				},
				{
					criteria: 'Thread Pool',
					before: 'Hızla tükenir',
					after: 'Verimli kullanılır',
				},
				{
					criteria: 'Bellek Kullanımı',
					before: 'Yüksek (thread başına ~1MB)',
					after: 'Düşük',
				},
				{
					criteria: '3 API Çağrısı Süresi',
					before: 'A + B + C (seri)',
					after: 'max(A, B, C) (paralel)',
				},
				{
					criteria: 'Deadlock Riski',
					before: 'Yüksek (.Result)',
					after: 'Yok (await)',
				},
				{
					criteria: 'Sunucu Kapasitesi',
					before: 'Thread sayısıyla sınırlı',
					after: 'I/O kapasitesiyle sınırlı',
				},
			]}
			interviewQuestions={[
				{
					question: 'async/await ne zaman kullanılmalı?',
					questionEn: 'When should async/await be used?',
					answer:
						"I/O-bound işlemlerde: HTTP çağrısı, veritabanı sorgusu, dosya okuma/yazma. Thread'in bekleyeceği her yerde. CPU-bound işlemlerde async değil, Task.Run ile ayrı thread kullan.",
					answerEn:
						'For I/O-bound operations: HTTP calls, database queries, file I/O. Anywhere thread would wait. For CPU-bound, use Task.Run for separate thread, not async.',
				},
				{
					question: 'async void neden tehlikeli?',
					questionEn: 'Why is async void dangerous?',
					answer:
						"Exception'ı yakalayamazsın, await edemezsin, ne zaman bittiğini bilemezsin. Sadece event handler'larda kullan. Normal metotlarda async Task kullan.",
					answerEn:
						"Can't catch exceptions, can't await, can't know when finished. Use only for event handlers. Use async Task for normal methods.",
				},
				{
					question: '.Result veya .Wait() kullanmak neden yanlış?',
					questionEn: 'Why is using .Result or .Wait() wrong?',
					answer:
						"Thread'i bloklar, async'in tüm faydasını yok eder. ASP.NET ve UI uygulamalarında deadlock riski var. Her zaman await kullan.",
					answerEn:
						'Blocks thread, negates all async benefits. Deadlock risk in ASP.NET and UI apps. Always use await.',
				},
				{
					question: 'Task.WhenAll vs Task.WhenAny farkı?',
					questionEn: 'Difference between Task.WhenAll and Task.WhenAny?',
					answer:
						"WhenAll: Tüm task'lar tamamlanınca devam eder. WhenAny: İlk tamamlanan task'ta devam eder (timeout, racing API calls için).",
					answerEn:
						'WhenAll: Continues when ALL tasks complete. WhenAny: Continues when FIRST task completes (for timeout, racing API calls).',
				},
				{
					question: 'ConfigureAwait(false) ne işe yarar?',
					questionEn: 'What does ConfigureAwait(false) do?',
					answer:
						"Continuation'ın orijinal context'te (UI thread, ASP.NET context) çalışmasını gerektirmez. Library kodunda kullan, UI kodunda kullanma.",
					answerEn:
						"Doesn't require continuation to run on original context (UI thread, ASP.NET context). Use in library code, not UI code.",
				},
			]}
			pitfalls={[
				"TUZAK: 'async her yerde performans artırır' → Yanlış! async overhead ekler. Sadece I/O-bound işlemlerde faydalı. Hızlı senkron işi async yapma.",
				"TUZAK: 'async Task yerine async void kullandım' → Event handler dışında async void kullanma. Exception kaybolur, test edilemez.",
			]}
			miniTask={{
				description:
					'Aşağıdaki senkron kodu async/await ile refactor edin ve 3 API çağrısını paralel yapın:\n\npublic CustomerData GetCustomerData(int customerId) {\n  var profile = GetProfile(customerId);      // 2 saniye\n  var orders = GetOrders(customerId);        // 3 saniye\n  var payments = GetPayments(customerId);    // 2 saniye\n  return new CustomerData(profile, orders, payments);\n}\n// Toplam: 7 saniye',
				hint: '3 metodu da async yapın. Task.WhenAll ile paralel çalıştırın. Toplam süre: max(2,3,2) = 3 saniye olmalı.',
			}}
		/>
	);
}
