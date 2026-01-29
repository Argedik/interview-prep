import { TopicPage } from '@/components/TopicPage';

export default function OopBasicsPage() {
	return (
		<TopicPage
			title="OOP: Temel Prensipler"
			titleEn="Object-Oriented Programming Fundamentals"
			description="OOP (Nesne Yönelimli Programlama), kodu sınıflar ve nesneler etrafında organize etme yaklaşımı. 4 temel prensip: Encapsulation (kapsülleme), Inheritance (kalıtım), Polymorphism (çok biçimlilik), Abstraction (soyutlama). Büyük sistemlerde kod organizasyonu ve yeniden kullanılabilirlik sağlar."
			descriptionEn="OOP organizes code around classes and objects. 4 pillars: Encapsulation (bundling data/methods), Inheritance (reuse), Polymorphism (many forms), Abstraction (hiding complexity). Enables code organization and reusability in large systems."
			context={{
				erp: "Belge (Document) hiyerarşisi: Fatura, Sipariş, İrsaliye hep 'Belge' sınıfından türer. Ortak özellikler (tarih, numara, müşteri) base class'ta, özel davranışlar alt sınıflarda.",
				crm: "İletişim kanalları: Email, SMS, Push Notification hep INotificationChannel interface'ini implement eder. Müşteriye bildirim gönderirken kanal değişse de kod değişmez.",
			}}
			naiveApproach={{
				explanation:
					'Procedural yaklaşım: Global değişkenler, uzun fonksiyonlar, kod tekrarı. Her belge türü için ayrı fonksiyonlar yazılır. Ortak mantık copy-paste ile çoğaltılır. Sistem büyüdükçe spagetti kod oluşur.',
				code: `// ❌ YANLIŞ: Procedural / Spagetti kod

// Global değişkenler (her yerden erişilebilir - tehlikeli!)
var invoices = [];
var orders = [];
var shipments = [];
var lastInvoiceNumber = 0;
var lastOrderNumber = 0;

// Fatura oluştur fonksiyonu
function createInvoice(customerId, items, date) {
    lastInvoiceNumber++;
    var invoiceNumber = "INV-" + lastInvoiceNumber;
    
    // Toplam hesapla (bu kod her yerde tekrar ediyor!)
    var total = 0;
    for (var i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    
    // KDV hesapla
    var tax = total * 0.20;
    var grandTotal = total + tax;
    
    // Validasyon (bu da her yerde tekrar!)
    if (!customerId) {
        throw new Error("Customer required");
    }
    if (items.length === 0) {
        throw new Error("Items required");
    }
    
    var invoice = {
        type: "invoice",
        number: invoiceNumber,
        customerId: customerId,
        items: items,
        date: date,
        total: grandTotal
    };
    
    invoices.push(invoice);
    
    // Email gönder (bu mantık da tekrar ediyor!)
    sendEmail(customerId, "Fatura: " + invoiceNumber, "Tutarınız: " + grandTotal);
    
    return invoice;
}

// Sipariş oluştur - AYNI KODLARIN %80'İ TEKRAR!
function createOrder(customerId, items, date) {
    lastOrderNumber++;
    var orderNumber = "ORD-" + lastOrderNumber;
    
    // ❌ AYNI KOD: Toplam hesapla
    var total = 0;
    for (var i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    
    // ❌ AYNI KOD: Validasyon
    if (!customerId) {
        throw new Error("Customer required");
    }
    
    var order = {
        type: "order",
        number: orderNumber,
        customerId: customerId,
        items: items,
        date: date,
        total: total,
        status: "pending"
    };
    
    orders.push(order);
    
    // ❌ AYNI KOD: Email gönder
    sendEmail(customerId, "Sipariş: " + orderNumber, "Toplam: " + total);
    
    return order;
}

// 50 tane daha fonksiyon... hepsi birbirine benziyor
// Bir yerde bug düzeltince 10 yeri daha değiştirmen lazım!`,
				language: 'javascript',
			}}
			problems={[
				'KOD TEKRARI: Toplam hesaplama, validasyon, email gönderme her fonksiyonda tekrar. DRY ihlali.',
				'GLOBAL STATE: invoices, orders global → herhangi bir yerden değiştirilebilir → beklenmedik buglar.',
				'DÜŞÜK COHESION: Bir fonksiyon hem hesaplama, hem validasyon, hem email, hem kayıt yapıyor. 100 satır fonksiyonlar.',
				'ZOR BAKIM: KDV oranı değişti → 10 fonksiyonda değiştir. Birini unutursan bug.',
				'TEST ZORLUĞU: Global state var, side effect var, izole test edilemiyor.',
			]}
			betterApproach={{
				explanation:
					"OOP ile: Base Document class'ı ortak özellikleri tutar. Invoice, Order alt sınıflar özel davranışları ekler. Private field'lar encapsulation sağlar. Polymorphism ile farklı belge tipleri aynı interface üzerinden işlenir.",
				code: `// ✅ DOĞRU: OOP ile organize kod

// 1. ENCAPSULATION: Veri ve davranış bir arada, private field'lar
class Document {
    // Private fields (dışarıdan doğrudan erişilemez)
    #number: string;
    #customerId: string;
    #items: LineItem[];
    #date: Date;
    #total: number;
    
    constructor(customerId: string, items: LineItem[], date: Date) {
        // Validasyon constructor'da, TEK YERDE
        if (!customerId) throw new Error("Customer required");
        if (items.length === 0) throw new Error("Items required");
        
        this.#customerId = customerId;
        this.#items = items;
        this.#date = date;
        this.#total = this.calculateTotal();  // Hesaplama TEK YERDE
    }
    
    // Getter: Kontrollü erişim
    get total(): number {
        return this.#total;
    }
    
    get customerId(): string {
        return this.#customerId;
    }
    
    // Protected method: Alt sınıflar kullanabilir
    protected calculateTotal(): number {
        return this.#items.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );
    }
    
    // ABSTRACTION: Karmaşıklık gizli, basit interface
    abstract generateNumber(): string;
    abstract getDocumentType(): string;
}

// 2. INHERITANCE: Ortak özellikler base class'ta, özel olanlar alt sınıfta
class Invoice extends Document {
    static #lastNumber = 0;
    #taxRate = 0.20;
    
    generateNumber(): string {
        Invoice.#lastNumber++;
        return \`INV-\${Invoice.#lastNumber.toString().padStart(5, '0')}\`;
    }
    
    getDocumentType(): string {
        return "Fatura";
    }
    
    // Faturaya özel: KDV hesabı
    get taxAmount(): number {
        return this.total * this.#taxRate;
    }
    
    get grandTotal(): number {
        return this.total + this.taxAmount;
    }
}

class Order extends Document {
    static #lastNumber = 0;
    #status: OrderStatus = "pending";
    
    generateNumber(): string {
        Order.#lastNumber++;
        return \`ORD-\${Order.#lastNumber.toString().padStart(5, '0')}\`;
    }
    
    getDocumentType(): string {
        return "Sipariş";
    }
    
    // Siparişe özel: Durum yönetimi
    approve(): void {
        if (this.#status !== "pending") {
            throw new Error("Only pending orders can be approved");
        }
        this.#status = "approved";
    }
}

// 3. POLYMORPHISM: Aynı interface, farklı davranış
class DocumentService {
    // Document tipinde parametre, ama Invoice veya Order olabilir
    sendNotification(document: Document): void {
        // getDocumentType() her sınıfta farklı sonuç döner
        const message = \`\${document.getDocumentType()} #\${document.generateNumber()}\`;
        this.emailService.send(document.customerId, message);
    }
    
    // Tüm belge tiplerini aynı şekilde işle
    processDocuments(documents: Document[]): void {
        for (const doc of documents) {
            this.sendNotification(doc);  // ✅ Polymorphism!
            // Invoice ise "Fatura", Order ise "Sipariş" yazar
        }
    }
}

// 4. Kullanım
const invoice = new Invoice("CUST-001", items, new Date());
const order = new Order("CUST-001", items, new Date());

const service = new DocumentService();
service.processDocuments([invoice, order]);  // ✅ İkisi de Document!`,
				language: 'typescript',
			}}
			comparison={[
				{
					criteria: 'Kod Tekrarı',
					before: 'Her fonksiyonda aynı kod',
					after: "Base class'ta tek yerde",
				},
				{
					criteria: 'Veri Güvenliği',
					before: 'Global, her yerden değişir',
					after: 'Private, kontrollü erişim',
				},
				{
					criteria: 'Değişiklik Etkisi',
					before: '10 yerde değiştir',
					after: '1 yerde değiştir',
				},
				{
					criteria: 'Yeni Tip Eklemek',
					before: 'Copy-paste + uyarla',
					after: 'extends + override',
				},
				{
					criteria: 'Test',
					before: 'Global state bozar',
					after: 'İzole test edilebilir',
				},
				{
					criteria: 'Okunabilirlik',
					before: '100 satır fonksiyon',
					after: 'Küçük, odaklı sınıflar',
				},
			]}
			interviewQuestions={[
				{
					question: "OOP'nin 4 temel prensibi nedir?",
					questionEn: 'What are the 4 pillars of OOP?',
					answer:
						'Encapsulation (veri+davranış bir arada, private), Inheritance (kalıtım, kod yeniden kullanımı), Polymorphism (aynı interface farklı davranış), Abstraction (karmaşıklığı gizle, basit interface sun).',
					answerEn:
						'Encapsulation (data+behavior together, private), Inheritance (code reuse), Polymorphism (same interface different behavior), Abstraction (hide complexity, simple interface).',
				},
				{
					question: 'Encapsulation neden önemli?',
					questionEn: 'Why is Encapsulation important?',
					answer:
						"Internal state'i korur, dışarıdan rastgele değişikliği engeller. Validasyon tek yerde yapılır. Implementation değişse de public interface sabit kalabilir. Kontrollü erişim sağlar.",
					answerEn:
						'Protects internal state from random external changes. Validation in one place. Implementation can change while public interface stays stable. Controlled access.',
				},
				{
					question: 'Composition vs Inheritance ne zaman?',
					questionEn: 'When to use Composition vs Inheritance?',
					answer:
						"'IS-A' ilişkisi varsa Inheritance (Fatura bir Belgedir). 'HAS-A' ilişkisi varsa Composition (Araba bir Motoru VAR). Composition daha esnek, tercih edilir. Inheritance sıkı bağlılık yaratır.",
					answerEn:
						'IS-A relationship → Inheritance (Invoice IS-A Document). HAS-A relationship → Composition (Car HAS-A Engine). Composition more flexible, preferred. Inheritance creates tight coupling.',
				},
				{
					question: 'Abstract class vs Interface farkı?',
					questionEn: 'Difference between Abstract class and Interface?',
					answer:
						"Abstract: Partial implementation, state tutabilir, tek inheritance. Interface: Sadece contract (imza), state yok, multiple inheritance. C# 8+ interface'te default implementation var.",
					answerEn:
						'Abstract: Partial implementation, can have state, single inheritance. Interface: Contract only, no state, multiple inheritance. C# 8+ interfaces can have default implementation.',
				},
				{
					question: "Polymorphism'in faydası ne?",
					questionEn: "What's the benefit of Polymorphism?",
					answer:
						'Aynı kod farklı tipleri işleyebilir. Yeni tip eklemek için mevcut kodu değiştirmek gerekmez (Open/Closed). Switch-case yerine method override. Daha esnek, genişletilebilir kod.',
					answerEn:
						"Same code can handle different types. Adding new type doesn't require changing existing code (Open/Closed). Method override instead of switch-case. More flexible, extensible code.",
				},
			]}
			pitfalls={[
				"TUZAK: 'Her şeyi inheritance ile çözeyim' → Yanlış! Deep inheritance hierarchy bakımı zorlaştırır. Composition over inheritance. Max 2-3 seviye.",
				"TUZAK: 'Getter/setter her field için' → Anemic domain model! Davranışları da sınıfa koy. setStatus() yerine approve(), reject() gibi iş mantığı metodları.",
			]}
			miniTask={{
				description:
					"Bir 'Shape' (Şekil) hiyerarşisi tasarlayın: Base class Shape (abstract), alt sınıflar Circle ve Rectangle. Her şeklin area() ve perimeter() metodları olsun. Polymorphism kullanarak bir dizi şeklin toplam alanını hesaplayan fonksiyon yazın.",
				hint: 'abstract class Shape { abstract area(): number; abstract perimeter(): number; }. Circle: Math.PI * r * r. Rectangle: width * height. shapes.reduce((sum, s) => sum + s.area(), 0).',
			}}
		/>
	);
}
