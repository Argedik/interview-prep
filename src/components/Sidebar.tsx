'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const topics = [
	{
		category: 'Dynamics 365 & Power Platform',
		items: [
			{ href: '/topics/dynamics-erp-crm', title: 'ERP vs CRM', priority: 3 },
			{ href: '/topics/power-bi', title: 'Power BI', priority: 3 },
			{ href: '/topics/power-apps', title: 'Power Apps', priority: 2 },
			{ href: '/topics/power-automate', title: 'Power Automate', priority: 2 },
			{ href: '/topics/power-pages', title: 'Power Pages', priority: 1 },
		],
	},
	{
		category: 'SQL Server & Veri',
		items: [
			{ href: '/topics/sql-index', title: 'Index & Performans', priority: 3 },
			{
				href: '/topics/sql-transaction',
				title: 'Transaction & Isolation',
				priority: 2,
			},
		],
	},
	{
		category: 'C# / .NET',
		items: [
			{ href: '/topics/dotnet-async', title: 'async/await', priority: 3 },
			{ href: '/topics/dotnet-di', title: 'Dependency Injection', priority: 3 },
			{
				href: '/topics/aspnet-middleware',
				title: 'Middleware & Pipeline',
				priority: 2,
			},
		],
	},
	{
		category: 'Mimari & Tasarım',
		items: [
			{ href: '/topics/oop-basics', title: 'OOP Temelleri', priority: 2 },
			{
				href: '/topics/solid-principles',
				title: 'SOLID Prensipleri',
				priority: 2,
			},
		],
	},
];

const PriorityBadge = ({ level }: { level: number }) => {
	const colors = {
		3: 'bg-red-500',
		2: 'bg-yellow-500',
		1: 'bg-green-500',
	};
	return (
		<span
			className={`w-2 h-2 rounded-full ${colors[level as keyof typeof colors]}`}
		/>
	);
};

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-72 bg-slate-900 text-white p-4 overflow-y-auto">
			<Link href="/" className="block mb-6">
				<h1 className="text-xl font-bold text-blue-400">🎯 ETG Hazırlık</h1>
				<p className="text-xs text-slate-400">Dynamics 365 Mülakat</p>
			</Link>

			<div className="mb-4 p-3 bg-slate-800 rounded-lg">
				<p className="text-xs text-slate-400 mb-1">Öncelik Renkleri:</p>
				<div className="flex gap-3 text-xs">
					<span className="flex items-center gap-1">
						<span className="w-2 h-2 rounded-full bg-red-500" /> Kritik
					</span>
					<span className="flex items-center gap-1">
						<span className="w-2 h-2 rounded-full bg-yellow-500" /> Önemli
					</span>
					<span className="flex items-center gap-1">
						<span className="w-2 h-2 rounded-full bg-green-500" /> Bonus
					</span>
				</div>
			</div>

			<nav className="space-y-4">
				{topics.map((section) => (
					<div key={section.category}>
						<h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
							{section.category}
						</h2>
						<ul className="space-y-1">
							{section.items.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
											pathname === item.href
												? 'bg-blue-600 text-white'
												: 'text-slate-300 hover:bg-slate-800'
										}`}
									>
										<PriorityBadge level={item.priority} />
										{item.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</nav>

			<div className="mt-8 p-3 bg-slate-800 rounded-lg">
				<p className="text-xs text-slate-400">⏰ Mülakat:</p>
				<p className="text-lg font-bold text-blue-400">~10 saat sonra</p>
			</div>
		</aside>
	);
}
