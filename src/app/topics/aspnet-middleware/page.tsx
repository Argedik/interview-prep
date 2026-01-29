import { TopicPage } from '@/components/TopicPage';

export default function AspnetMiddlewarePage() {
	return (
		<TopicPage
			title="ASP.NET Core: Middleware & Pipeline"
			titleEn="Request Processing Pipeline and Middleware in ASP.NET Core"
			description="Middleware, HTTP request/response'u işleyen pipeline bileşenleridir. Her middleware ya bir sonrakine geçirir (next()) ya da response döner (short-circuit). Sıralama önemli! Logging, authentication, error handling, CORS hep middleware ile yapılır."
			descriptionEn="Middleware are pipeline components that process HTTP requests/responses. Each middleware either passes to next (next()) or returns response (short-circuit). Order matters! Logging, authentication, error handling, CORS are all done via middleware."
			context={{
				erp: "Dynamics 365 API Gateway: Her isteği logla, JWT doğrula, rate limit uygula, sonra controller'a geçir. Global error handling ile tutarlı hata response'u.",
				crm: "Multi-tenant SaaS: Her isteğin tenant header'ını oku, doğru veritabanına yönlendir. Middleware ile tenant context ayarla.",
			}}
			naiveApproach={{
				explanation:
					"Her controller'da aynı kodlar tekrarlanır: logging, validation, error handling. Kod duplikasyonu, tutarsız davranış, bakım zorluğu. Bir yerde düzeltilen bug diğer yerlerde kalmaya devam eder.",
				code: `// ❌ YANLIŞ: Her controller'da tekrar eden kod

[ApiController]
public class OrdersController : ControllerBase
{
    [HttpGet("{id}")]
    public IActionResult GetOrder(int id)
    {
        // ❌ Her endpoint'te logging tekrarı
        _logger.LogInformation($"GetOrder called: {id}");
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            // ❌ Her endpoint'te auth kontrolü tekrarı
            var token = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token required");
            }
            
            var user = ValidateToken(token);
            if (user == null)
            {
                return Unauthorized("Invalid token");
            }
            
            // ❌ Her endpoint'te validation tekrarı
            if (id <= 0)
            {
                return BadRequest("Invalid ID");
            }
            
            // Asıl iş mantığı
            var order = _orderService.GetById(id);
            
            if (order == null)
            {
                return NotFound();
            }
            
            // ❌ Logging tekrarı
            stopwatch.Stop();
            _logger.LogInformation($"GetOrder completed: {stopwatch.ElapsedMilliseconds}ms");
            
            return Ok(order);
        }
        catch (Exception ex)
        {
            // ❌ Her endpoint'te error handling tekrarı
            _logger.LogError(ex, "Error in GetOrder");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
    
    [HttpPost]
    public IActionResult CreateOrder(OrderDto dto)
    {
        // ❌ AYNI KODLAR TEKRAR! 50 endpoint = 50x tekrar
        _logger.LogInformation("CreateOrder called");
        
        try
        {
            var token = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(token)) return Unauthorized();
            // ... aynı kod bloğu ...
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error");
            return StatusCode(500, "Error");  // ❌ Farklı format!
        }
    }
}`,
				language: 'csharp',
			}}
			problems={[
				"KOD TEKRARI (DRY İhlali): Logging, auth, error handling her controller'da tekrar. 50 endpoint = 50x aynı kod.",
				"TUTARSIZLIK: Bir endpoint 'error' döner, diğeri 'message' döner. API kullanıcısı karışır.",
				'BAKIM ZORLUĞU: Logging formatı değişecek → 50 yerde değiştir. Bir yeri unutursan bug.',
				"TEST ZORLUĞU: Cross-cutting concern'ler iş mantığıyla karışık. İzole test edilemiyor.",
				"HATA RİSKİ: Bir endpoint'te try-catch unutuldu → unhandled exception, 500 hata, detay sızıntısı.",
			]}
			betterApproach={{
				explanation:
					"Cross-cutting concern'ler (logging, error handling, auth) middleware'e taşınır. Controller sadece iş mantığı ile ilgilenir. Pipeline sıralı çalışır, her middleware sorumluluğunu yapar.",
				code: `// ✅ DOĞRU: Middleware ile cross-cutting concerns

// 1. Custom Middleware: Request Logging
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestId = Guid.NewGuid().ToString("N")[..8];
        
        // Request başlangıç logu
        _logger.LogInformation(
            "[{RequestId}] {Method} {Path} started",
            requestId, context.Request.Method, context.Request.Path);
        
        // Sonraki middleware'e geç
        await _next(context);
        
        // Response logu
        stopwatch.Stop();
        _logger.LogInformation(
            "[{RequestId}] {Method} {Path} completed: {StatusCode} in {Elapsed}ms",
            requestId, context.Request.Method, context.Request.Path,
            context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
    }
}

// 2. Global Exception Handler Middleware
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error");
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new {
                error = "Validation Error",
                details = ex.Errors
            });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Not found");
            context.Response.StatusCode = 404;
            await context.Response.WriteAsJsonAsync(new {
                error = "Not Found",
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new {
                error = "Internal Server Error",
                traceId = Activity.Current?.Id ?? context.TraceIdentifier
            });
        }
    }
}

// 3. Pipeline Kayıt (Program.cs) - SIRALAMA ÖNEMLİ!
var app = builder.Build();

// 1️⃣ En dışta: Exception handling (her şeyi yakalar)
app.UseMiddleware<GlobalExceptionMiddleware>();

// 2️⃣ Logging (request/response)
app.UseMiddleware<RequestLoggingMiddleware>();

// 3️⃣ HTTPS yönlendirme
app.UseHttpsRedirection();

// 4️⃣ CORS (cross-origin requests)
app.UseCors("AllowFrontend");

// 5️⃣ Authentication (kim?)
app.UseAuthentication();

// 6️⃣ Authorization (ne yapabilir?)
app.UseAuthorization();

// 7️⃣ Rate Limiting
app.UseRateLimiter();

// 8️⃣ Endpoint routing
app.MapControllers();

// 4. Temiz Controller - sadece iş mantığı
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        // ✅ Sadece iş mantığı, logging/auth/error yok
        var order = await _orderService.GetByIdAsync(id);
        
        if (order == null)
            throw new NotFoundException($"Order {id} not found");
        
        return Ok(order);
    }
}`,
				language: 'csharp',
			}}
			comparison={[
				{
					criteria: 'Kod Tekrarı',
					before: "Her endpoint'te aynı kod",
					after: "Tek middleware, tüm endpoint'ler",
				},
				{
					criteria: 'Tutarlılık',
					before: 'Her yerde farklı format',
					after: 'Her yerde aynı format',
				},
				{
					criteria: 'Bakım',
					before: '50 yerde değiştir',
					after: '1 yerde değiştir',
				},
				{
					criteria: 'Test',
					before: 'Cross-cutting karışık',
					after: 'Middleware ayrı test edilir',
				},
				{
					criteria: 'Controller Okunabilirliği',
					before: 'Karmaşık (100+ satır)',
					after: 'Sade (10-20 satır)',
				},
				{
					criteria: 'Hata Riski',
					before: 'Yüksek (unutma riski)',
					after: 'Düşük (otomatik)',
				},
			]}
			interviewQuestions={[
				{
					question: 'Middleware sıralaması neden önemli?',
					questionEn: 'Why does middleware order matter?',
					answer:
						"İlk eklenen dışta, son eklenen içte çalışır. Exception handler en dışta olmalı ki her hatayı yakalasın. Authentication, Authorization'dan önce olmalı. Sıra yanlışsa güvenlik açığı veya hata.",
					answerEn:
						'First added runs outermost, last added innermost. Exception handler must be outermost to catch all. Authentication before Authorization. Wrong order causes security holes or errors.',
				},
				{
					question: 'Short-circuit middleware ne demek?',
					questionEn: 'What is short-circuit middleware?',
					answer:
						"next() çağırmadan response dönen middleware. Örnek: auth middleware token geçersizse 401 dönüp pipeline'ı durdurur. Static file middleware dosya bulursa döner. Cache middleware cache hit'te döner.",
					answerEn:
						'Middleware that returns response without calling next(). Example: auth returns 401 if token invalid. Static file returns if found. Cache middleware returns on cache hit.',
				},
				{
					question: 'app.Use vs app.Run vs app.Map farkı?',
					questionEn: 'Difference between app.Use, app.Run, and app.Map?',
					answer:
						"Use: next() çağırabilir, zincirleme. Run: Terminal, next yok, pipeline sonu. Map: Path'e göre branch, farklı pipeline. UseWhen: Koşula göre middleware çalıştır.",
					answerEn:
						'Use: Can call next(), chainable. Run: Terminal, no next, ends pipeline. Map: Branches by path, different pipeline. UseWhen: Conditional middleware execution.',
				},
				{
					question: 'Middleware vs Filter farkı nedir?',
					questionEn: "What's the difference between Middleware and Filter?",
					answer:
						'Middleware: HTTP pipeline seviyesi, tüm istekler. Filter: MVC/API seviyesi, action execution etrafında. Authorization, Resource, Action, Exception, Result filter türleri var. Filter daha spesifik.',
					answerEn:
						'Middleware: HTTP pipeline level, all requests. Filter: MVC/API level, around action execution. Authorization, Resource, Action, Exception, Result filter types. Filters more specific.',
				},
				{
					question: 'Request pipeline nasıl çalışır?',
					questionEn: 'How does the request pipeline work?',
					answer:
						"Request → Middleware1 → Middleware2 → ... → Endpoint. Response geri dönerken: Endpoint → ... → Middleware2 → Middleware1 → Response. Her middleware hem request hem response'u görebilir.",
					answerEn:
						'Request → Middleware1 → Middleware2 → ... → Endpoint. Response returns: Endpoint → ... → Middleware2 → Middleware1 → Response. Each middleware sees both request and response.',
				},
			]}
			pitfalls={[
				"TUZAK: 'UseAuthentication UseAuthorization'dan sonra' → Yanlış! Önce kim olduğunu bil (AuthN), sonra ne yapabilir kontrol et (AuthZ).",
				"TUZAK: 'Exception middleware en içte' → Yanlış! En dışta olmalı ki diğer middleware'lerin hatalarını da yakalasın.",
			]}
			miniTask={{
				description:
					"Basit bir RequestTimingMiddleware yazın: Her request'in başlangıç zamanını kaydet, response dönmeden önce geçen süreyi hesapla ve X-Response-Time header'ı ekle. InvokeAsync metodunu implement edin.",
				hint: "Stopwatch.StartNew() ile başla. await _next(context) sonrası stopwatch.Stop(). context.Response.Headers.Add('X-Response-Time', $'{ms}ms').",
			}}
		/>
	);
}
