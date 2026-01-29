import { TopicPage } from '@/components/TopicPage';

export default function SolidPrinciplesPage() {
	return (
		<TopicPage
			title="SOLID Prensipleri"
			titleEn="SOLID Object-Oriented Design Principles"
			description="SOLID, Robert C. Martin'in (Uncle Bob) tanımladığı 5 OOP tasarım prensibi. S: Single Responsibility, O: Open/Closed, L: Liskov Substitution, I: Interface Segregation, D: Dependency Inversion. Bakımı kolay, esnek, test edilebilir kod için rehber."
			descriptionEn="SOLID is 5 OOP design principles by Robert C. Martin. S: Single Responsibility, O: Open/Closed, L: Liskov Substitution, I: Interface Segregation, D: Dependency Inversion. Guide for maintainable, flexible, testable code."
			context={{
				erp: 'Fatura servisi: Sadece fatura işlemleri (SRP). Yeni vergi türü eklemek için mevcut kodu değiştirme (OCP). PDF/Excel export farklı sınıflarda (ISP).',
				crm: "Bildirim sistemi: INotification interface'i (DIP). Email, SMS, Push ayrı sınıflar (SRP). Yeni kanal eklemek kolay (OCP).",
			}}
			naiveApproach={{
				explanation:
					'Tek sınıf her şeyi yapıyor: veri erişimi, iş mantığı, validasyon, email, raporlama. God class / Big ball of mud. Değişiklik yapınca her şey kırılıyor, test etmek imkansız.',
				code: `// ❌ YANLIŞ: SOLID ihlali - God Class

class InvoiceManager {
    private connectionString: string;
    
    // ❌ SRP İHLALİ: Tek sınıf 5 farklı sorumluluk taşıyor
    
    // 1. Veritabanı işlemleri
    saveToDatabase(invoice: Invoice): void {
        const conn = new SqlConnection(this.connectionString);
        conn.execute("INSERT INTO Invoices ...", invoice);
    }
    
    // 2. Validasyon
    validate(invoice: Invoice): boolean {
        if (!invoice.customerId) return false;
        if (invoice.items.length === 0) return false;
        if (invoice.total <= 0) return false;
        // 50 satır daha validasyon...
        return true;
    }
    
    // 3. Vergi hesaplama
    calculateTax(invoice: Invoice): number {
        // ❌ OCP İHLALİ: Yeni vergi türü = bu kodu değiştir
        if (invoice.country === "TR") {
            return invoice.total * 0.20;  // KDV
        } else if (invoice.country === "DE") {
            return invoice.total * 0.19;  // German VAT
        } else if (invoice.country === "UK") {
            return invoice.total * 0.20;  // UK VAT
        }
        // Yeni ülke eklemek için buraya if ekle...
        return 0;
    }
    
    // 4. Email gönderme
    sendEmail(invoice: Invoice): void {
        var smtp = new SmtpClient("smtp.gmail.com");
        smtp.send(invoice.customerEmail, "Faturanız", this.generateHtml(invoice));
    }
    
    // 5. PDF oluşturma
    generatePdf(invoice: Invoice): byte[] {
        // 200 satır PDF generation kodu...
    }
    
    // 6. Excel export
    generateExcel(invoice: Invoice): byte[] {
        // 150 satır Excel kodu...
    }
    
    // 7. Raporlama
    getMonthlyReport(month: number): Report {
        // SQL sorguları, hesaplamalar...
    }
}

// ❌ DIP İHLALİ: Concrete class'a bağımlı
class InvoiceController {
    // ❌ InvoiceManager'a sıkı bağlı, mock yapılamaz
    private manager = new InvoiceManager();
    
    create(dto: InvoiceDto): void {
        this.manager.saveToDatabase(dto);  // Gerçek DB!
        this.manager.sendEmail(dto);        // Gerçek email!
    }
}`,
				language: 'typescript',
			}}
			problems={[
				'SRP İHLALİ: InvoiceManager 7 farklı iş yapıyor. Değişiklik sebebi 7 tane. DB değişince, email değişince, vergi değişince hep bu sınıf değişiyor.',
				"OCP İHLALİ: Yeni ülke/vergi eklemek için calculateTax'ı değiştirmek lazım. Mevcut çalışan kodu bozmak riski.",
				"DIP İHLALİ: Controller concrete InvoiceManager'a bağımlı. Test'te mock yapamıyoruz, gerçek DB ve email gerekiyor.",
				'TEST ZORLUĞU: Sadece vergi hesabını test etmek için DB bağlantısı gerekiyor çünkü hepsi bir arada.',
				'BAKIM KABUSU: 1000 satırlık sınıf. Bir değişiklik yapmak için her şeyi anlamak lazım.',
			]}
			betterApproach={{
				explanation:
					"Her prensip uygulanır: Tek sorumluluk sınıfları, Strategy pattern ile OCP, Interface'ler ile DIP. Küçük, odaklı, test edilebilir sınıflar.",
				code: `// ✅ DOĞRU: SOLID uyumlu tasarım

// ═══════════════════════════════════════════════════════════
// S - SINGLE RESPONSIBILITY: Her sınıf tek sorumluluk
// ═══════════════════════════════════════════════════════════

// Sadece validasyon
class InvoiceValidator {
    validate(invoice: Invoice): ValidationResult {
        const errors: string[] = [];
        if (!invoice.customerId) errors.push("Customer required");
        if (invoice.items.length === 0) errors.push("Items required");
        return { isValid: errors.length === 0, errors };
    }
}

// Sadece veritabanı
class InvoiceRepository {
    constructor(private db: IDatabase) {}
    
    save(invoice: Invoice): void {
        this.db.insert("Invoices", invoice);
    }
    
    getById(id: string): Invoice | null {
        return this.db.query("SELECT * FROM Invoices WHERE Id = @id", { id });
    }
}

// Sadece email
class InvoiceEmailSender {
    constructor(private emailService: IEmailService) {}
    
    sendInvoiceEmail(invoice: Invoice): void {
        this.emailService.send(invoice.customerEmail, "Faturanız", /*...*/);
    }
}

// ═══════════════════════════════════════════════════════════
// O - OPEN/CLOSED: Değişikliğe kapalı, genişlemeye açık
// ═══════════════════════════════════════════════════════════

// Strategy Pattern ile vergi hesaplama
interface ITaxCalculator {
    countryCode: string;
    calculate(amount: number): number;
}

class TurkeyTaxCalculator implements ITaxCalculator {
    countryCode = "TR";
    calculate(amount: number): number {
        return amount * 0.20;  // KDV %20
    }
}

class GermanyTaxCalculator implements ITaxCalculator {
    countryCode = "DE";
    calculate(amount: number): number {
        return amount * 0.19;  // MwSt %19
    }
}

// ✅ Yeni ülke = yeni sınıf, mevcut kod DEĞİŞMEZ
class UKTaxCalculator implements ITaxCalculator {
    countryCode = "UK";
    calculate(amount: number): number {
        return amount * 0.20;
    }
}

// Tax hesaplama servisi - OCP uyumlu
class TaxService {
    private calculators: Map<string, ITaxCalculator>;
    
    constructor(calculators: ITaxCalculator[]) {
        this.calculators = new Map(
            calculators.map(c => [c.countryCode, c])
        );
    }
    
    calculateTax(country: string, amount: number): number {
        const calculator = this.calculators.get(country);
        if (!calculator) throw new Error(\`Unknown country: \${country}\`);
        return calculator.calculate(amount);  // ✅ Polymorphism!
    }
}

// ═══════════════════════════════════════════════════════════
// I - INTERFACE SEGREGATION: Küçük, odaklı interface'ler
// ═══════════════════════════════════════════════════════════

// ❌ KÖTÜ: Fat interface
interface IInvoiceOperations {
    save(invoice: Invoice): void;
    delete(invoice: Invoice): void;
    sendEmail(invoice: Invoice): void;
    generatePdf(invoice: Invoice): byte[];
    generateExcel(invoice: Invoice): byte[];
}

// ✅ İYİ: Ayrılmış interface'ler
interface IInvoiceRepository {
    save(invoice: Invoice): void;
    delete(invoice: Invoice): void;
}

interface IInvoiceNotifier {
    notify(invoice: Invoice): void;
}

interface IInvoiceExporter {
    export(invoice: Invoice): byte[];
}

// Her sınıf sadece ihtiyacı olan interface'i implement eder
class PdfExporter implements IInvoiceExporter {
    export(invoice: Invoice): byte[] { /* PDF logic */ }
}

class ExcelExporter implements IInvoiceExporter {
    export(invoice: Invoice): byte[] { /* Excel logic */ }
}

// ═══════════════════════════════════════════════════════════
// D - DEPENDENCY INVERSION: Abstraction'a bağlan
// ═══════════════════════════════════════════════════════════

// ✅ Interface'lere bağımlı, concrete'lere değil
class InvoiceService {
    constructor(
        private validator: IInvoiceValidator,      // Interface
        private repository: IInvoiceRepository,    // Interface
        private notifier: IInvoiceNotifier,        // Interface
        private taxService: ITaxService            // Interface
    ) {}
    
    async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
        // Validasyon
        const validation = this.validator.validate(dto);
        if (!validation.isValid) {
            throw new ValidationException(validation.errors);
        }
        
        // Vergi hesapla
        const tax = this.taxService.calculateTax(dto.country, dto.total);
        
        // Kaydet
        const invoice = new Invoice({ ...dto, tax });
        await this.repository.save(invoice);
        
        // Bildirim
        await this.notifier.notify(invoice);
        
        return invoice;
    }
}

// ✅ Test: Mock'lar ile kolay test
const mockValidator = { validate: () => ({ isValid: true, errors: [] }) };
const mockRepository = { save: jest.fn() };
const mockNotifier = { notify: jest.fn() };
const mockTaxService = { calculateTax: () => 20 };

const service = new InvoiceService(
    mockValidator, mockRepository, mockNotifier, mockTaxService
);`,
				language: 'typescript',
			}}
			comparison={[
				{
					criteria: 'Sınıf Boyutu',
					before: '1000+ satır God class',
					after: '50-100 satır odaklı sınıflar',
				},
				{
					criteria: 'Değişiklik Etkisi',
					before: 'Her şey etkilenir',
					after: 'Sadece ilgili sınıf',
				},
				{
					criteria: 'Yeni Özellik Eklemek',
					before: 'Mevcut kodu değiştir',
					after: 'Yeni sınıf ekle',
				},
				{
					criteria: 'Test Edilebilirlik',
					before: 'Gerçek DB/email gerekli',
					after: 'Mock ile izole test',
				},
				{
					criteria: 'Anlaşılabilirlik',
					before: 'Tüm kodu oku',
					after: 'İlgili sınıfı oku',
				},
				{
					criteria: 'Takım Çalışması',
					before: 'Çakışma riski',
					after: 'Paralel geliştirme',
				},
			]}
			interviewQuestions={[
				{
					question: 'Single Responsibility Principle (SRP) ne demek?',
					questionEn: 'What does Single Responsibility Principle mean?',
					answer:
						'Bir sınıfın değişmesi için tek bir sebep olmalı. Tek bir sorumluluk, tek bir iş. Örnek: InvoiceValidator sadece validasyon, InvoiceRepository sadece veri erişimi. Karıştırma.',
					answerEn:
						"A class should have only one reason to change. One responsibility, one job. Example: InvoiceValidator only validates, InvoiceRepository only data access. Don't mix.",
				},
				{
					question: 'Open/Closed Principle nasıl uygulanır?',
					questionEn: 'How is Open/Closed Principle applied?',
					answer:
						'Genişlemeye açık, değişikliğe kapalı. Yeni davranış eklemek için mevcut kodu değiştirme. Strategy pattern, Template method, Decorator pattern ile. if-else zinciri yerine polymorphism.',
					answerEn:
						'Open for extension, closed for modification. Add new behavior without changing existing code. Use Strategy, Template method, Decorator patterns. Polymorphism instead of if-else chains.',
				},
				{
					question: 'Liskov Substitution Principle (LSP) nedir?',
					questionEn: 'What is Liskov Substitution Principle?',
					answer:
						'Alt sınıf, üst sınıfın yerine geçebilmeli, davranışı bozmamalı. Square extends Rectangle → getArea() bozulmamalı. Precondition güçlendirme, postcondition zayıflatma yasak.',
					answerEn:
						"Subclass must be substitutable for base class without breaking behavior. Square extends Rectangle → getArea() must work. Can't strengthen preconditions, can't weaken postconditions.",
				},
				{
					question: 'Interface Segregation Principle ne diyor?',
					questionEn: 'What does Interface Segregation Principle say?',
					answer:
						"Client'ı kullanmadığı metodlara bağımlı yapma. Büyük interface yerine küçük, odaklı interface'ler. IWorker yerine ICanWork, ICanEat ayrı. Robot ICanWork implement eder, ICanEat etmez.",
					answerEn:
						"Don't force clients to depend on methods they don't use. Small, focused interfaces instead of big ones. Instead of IWorker, use ICanWork, ICanEat separately. Robot implements ICanWork only.",
				},
				{
					question: 'Dependency Inversion Principle faydası ne?',
					questionEn: "What's the benefit of Dependency Inversion Principle?",
					answer:
						"Yüksek seviye modül, düşük seviyeye bağımlı olmamalı. İkisi de abstraction'a bağımlı olmalı. Gevşek bağlılık sağlar. Test'te mock kolaylaşır. Implementation değiştirmek kolay.",
					answerEn:
						"High-level modules shouldn't depend on low-level. Both depend on abstractions. Enables loose coupling. Easy to mock in tests. Easy to swap implementations.",
				},
			]}
			pitfalls={[
				"TUZAK: 'Her metod ayrı sınıfta olsun' → Aşırı parçalama! SRP = 1 sorumluluk demek, 1 metod demek değil. İlgili metodlar bir arada olabilir.",
				"TUZAK: 'Interface her yere lazım' → Overengineering! Tek implementasyon varsa ve değişme ihtimali düşükse interface gereksiz olabilir. YAGNI.",
			]}
			miniTask={{
				description:
					'Aşağıdaki kodu SOLID prensiplerine göre refactor edin: Bir ReportGenerator sınıfı var, hem PDF hem Excel üretiyor, hem veritabanından veri çekiyor, hem email gönderiyor. 4 sorumluluğu ayırın.',
				hint: 'IReportDataProvider (veri), IReportExporter (PDF/Excel - Strategy), IReportNotifier (email). ReportService bunları orchestrate eder. Her biri ayrı test edilebilir.',
			}}
		/>
	);
}
