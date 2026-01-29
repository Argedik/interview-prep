import Link from 'next/link';

const studyPlan = [
	{
		time: 'Saat 1-2',
		focus: 'Dynamics 365 & Power Platform',
		topics: [
			{ href: '/topics/dynamics-erp-crm', title: 'ERP vs CRM' },
			{ href: '/topics/power-bi', title: 'Power BI' },
		],
	},
	{
		time: 'Saat 3-4',
		focus: "SQL Server (ERP'nin Kalbi)",
		topics: [
			{ href: '/topics/sql-index', title: 'Index & Performans' },
			{ href: '/topics/sql-transaction', title: 'Transaction & Isolation' },
		],
	},
	{
		time: 'Saat 5-6',
		focus: 'C# / .NET Core',
		topics: [
			{ href: '/topics/dotnet-async', title: 'async/await' },
			{ href: '/topics/dotnet-di', title: 'Dependency Injection' },
			{ href: '/topics/aspnet-middleware', title: 'Middleware' },
		],
	},
];

const quickAnswers = [
	{
		q: 'ERP ve CRM farkı nedir?',
		a: 'ERP: İç operasyonlar (finans, stok, üretim). CRM: Müşteri ilişkileri (satış, pazarlama, destek).',
	},
	{
		q: 'Power Platform neden 4 ürün?',
		a: 'Her biri farklı ihtiyaca cevap verir: BI→raporlama, Apps→uygulama, Automate→otomasyon, Pages→portal.',
	},
	{
		q: 'async/await ne işe yarar?',
		a: "I/O işlemleri sırasında thread'i bloklamadan bekletir, kaynakları verimli kullanır.",
	},
	{
		q: 'DI neden önemli?',
		a: 'Gevşek bağlılık (loose coupling) sağlar, test edilebilirliği artırır, bağımlılıkları merkezi yönetir.',
	},
	{
		q: 'Index neden önemli?',
		a: '1M kayıtta O(n) yerine O(log n) arama sağlar. B-tree ile saniyeler yerine milisaniyede sonuç.',
	},
];

export default function Home() {
	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
			{/* Header */}
			<header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
				<h1 className="text-3xl font-bold mb-2">
					🎯 ETG Global Mülakat Hazırlık
				</h1>
				<p className="text-blue-100">
					Dynamics 365 Finance & Supply Chain • Full-Stack Developer Pozisyonu
				</p>
			</header>

			<div className="max-w-6xl mx-auto p-6 space-y-8">
				{/* Hızlı Başlangıç */}
				<section className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
					<h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
						⚡ 6 Saatlik Yoğun Plan
					</h2>
					<div className="grid md:grid-cols-3 gap-4">
						{studyPlan.map((block) => (
							<div
								key={block.time}
								className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
							>
								<h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
									{block.time}
								</h3>
								<p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
									{block.focus}
								</p>
								<ul className="space-y-1">
									{block.topics.map((topic) => (
										<li key={topic.href}>
											<Link
												href={topic.href}
												className="text-sm text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
											>
												→ {topic.title}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</section>

				{/* Top 5 Kritik Konular */}
				<section className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
					<h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
						🔥 Top 5 Kritik Konu
					</h2>
					<div className="grid md:grid-cols-5 gap-3">
						{[
							{
								href: '/topics/dynamics-erp-crm',
								title: 'ERP vs CRM',
								icon: '🏢',
							},
							{ href: '/topics/sql-index', title: 'SQL Index', icon: '🔍' },
							{
								href: '/topics/dotnet-async',
								title: 'async/await',
								icon: '⚡',
							},
							{ href: '/topics/dotnet-di', title: 'DI Lifetime', icon: '💉' },
							{ href: '/topics/power-bi', title: 'Power Platform', icon: '📊' },
						].map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 text-center hover:scale-105 transition-transform"
							>
								<span className="text-2xl">{item.icon}</span>
								<p className="text-sm font-medium mt-2 text-slate-700 dark:text-slate-200">
									{item.title}
								</p>
							</Link>
						))}
					</div>
				</section>

				{/* Hızlı Cevaplar */}
				<section className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
					<h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
						💬 10 Saniyelik Cevaplar (Ezberle!)
					</h2>
					<div className="space-y-3">
						{quickAnswers.map((item, i) => (
							<div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
								<p className="font-medium text-slate-800 dark:text-white">
									Q: {item.q}
								</p>
								<p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
									A: {item.a}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Format Açıklaması */}
				<section className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
					<h2 className="text-lg font-bold mb-3 text-blue-800 dark:text-blue-300">
						📋 Her Sayfa Formatı
					</h2>
					<ol className="text-sm text-blue-700 dark:text-blue-200 space-y-1 list-decimal list-inside">
						<li>Konu nedir? (EN/TR tanım)</li>
						<li>ETG/Dynamics 365 bağlamı</li>
						<li>
							<strong>Çözümsüz yaklaşım</strong> → kod + problemler
						</li>
						<li>
							<strong>Çözümlü yaklaşım</strong> → kod + iyileştirmeler
						</li>
						<li>Önce/Sonra karşılaştırma tablosu</li>
						<li>5 mülakat sorusu + cevapları</li>
						<li>10 dakikalık mini ödev</li>
					</ol>
				</section>
			</div>
		</div>
	);
}
