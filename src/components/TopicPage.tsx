'use client';

import { useState } from 'react';

interface TopicPageProps {
	title: string;
	titleEn: string;
	description: string;
	descriptionEn: string;
	context: {
		erp: string;
		crm: string;
	};
	naiveApproach: {
		explanation: string;
		code: string;
		language: string;
	};
	problems: string[];
	betterApproach: {
		explanation: string;
		code: string;
		language: string;
	};
	comparison: {
		criteria: string;
		before: string;
		after: string;
	}[];
	interviewQuestions: {
		question: string;
		questionEn: string;
		answer: string;
		answerEn: string;
	}[];
	pitfalls: string[];
	miniTask: {
		description: string;
		hint: string;
	};
}

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative">
			<div className="absolute right-2 top-2">
				<button
					onClick={handleCopy}
					className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded"
				>
					{copied ? '✓ Kopyalandı' : 'Kopyala'}
				</button>
			</div>
			<pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
				<code className={`language-${language}`}>{code}</code>
			</pre>
		</div>
	);
};

const Section = ({
	title,
	icon,
	children,
	variant = 'default',
}: {
	title: string;
	icon: string;
	children: React.ReactNode;
	variant?: 'default' | 'danger' | 'success' | 'warning';
}) => {
	const variants = {
		default:
			'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
		danger: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
		success:
			'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
		warning:
			'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
	};

	return (
		<section className={`rounded-xl border p-6 ${variants[variant]}`}>
			<h2 className="text-lg font-bold mb-4 flex items-center gap-2">
				<span>{icon}</span>
				{title}
			</h2>
			{children}
		</section>
	);
};

export function TopicPage({
	title,
	titleEn,
	description,
	descriptionEn,
	context,
	naiveApproach,
	problems,
	betterApproach,
	comparison,
	interviewQuestions,
	pitfalls,
	miniTask,
}: TopicPageProps) {
	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
			{/* Header */}
			<header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
				<h1 className="text-2xl font-bold mb-1">{title}</h1>
				<p className="text-blue-200 text-sm italic">{titleEn}</p>
			</header>

			<div className="max-w-4xl mx-auto p-6 space-y-6">
				{/* 1. Konu Nedir */}
				<Section title="1. Konu Nedir? (What?)" icon="📖">
					<div className="space-y-2">
						<p className="text-slate-700 dark:text-slate-200">
							<strong>TR:</strong> {description}
						</p>
						<p className="text-slate-600 dark:text-slate-300 text-sm italic">
							<strong>EN:</strong> {descriptionEn}
						</p>
					</div>
				</Section>

				{/* 2. ETG/Dynamics 365 Bağlamı */}
				<Section title="2. ETG/Dynamics 365 Bağlamı" icon="🏢">
					<div className="grid md:grid-cols-2 gap-4">
						<div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
							<h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
								ERP Senaryosu
							</h3>
							<p className="text-sm text-slate-700 dark:text-slate-300">
								{context.erp}
							</p>
						</div>
						<div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
							<h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
								CRM Senaryosu
							</h3>
							<p className="text-sm text-slate-700 dark:text-slate-300">
								{context.crm}
							</p>
						</div>
					</div>
				</Section>

				{/* 3. Çözümsüz Yaklaşım */}
				<Section
					title="3. Çözümsüz Yaklaşım (Naive Way)"
					icon="❌"
					variant="danger"
				>
					<p className="text-slate-700 dark:text-slate-300 mb-4">
						{naiveApproach.explanation}
					</p>
					<CodeBlock
						code={naiveApproach.code}
						language={naiveApproach.language}
					/>
				</Section>

				{/* 4. Problemler */}
				<Section
					title="4. Bu Yaklaşımın Problemleri"
					icon="⚠️"
					variant="warning"
				>
					<ul className="space-y-2">
						{problems.map((problem, i) => (
							<li key={i} className="flex items-start gap-2">
								<span className="text-red-500 font-bold">{i + 1}.</span>
								<span className="text-slate-700 dark:text-slate-300">
									{problem}
								</span>
							</li>
						))}
					</ul>
				</Section>

				{/* 5. Çözümlü Yaklaşım */}
				<Section
					title="5. Çözümlü Yaklaşım (Better Way)"
					icon="✅"
					variant="success"
				>
					<p className="text-slate-700 dark:text-slate-300 mb-4">
						{betterApproach.explanation}
					</p>
					<CodeBlock
						code={betterApproach.code}
						language={betterApproach.language}
					/>
				</Section>

				{/* 6. Karşılaştırma Tablosu */}
				<Section title="6. Önce/Sonra Karşılaştırması" icon="📊">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-slate-200 dark:border-slate-700">
									<th className="text-left p-3 font-semibold">Kriter</th>
									<th className="text-left p-3 font-semibold text-red-600">
										Öncesi (Naive)
									</th>
									<th className="text-left p-3 font-semibold text-green-600">
										Sonrası (Better)
									</th>
								</tr>
							</thead>
							<tbody>
								{comparison.map((row, i) => (
									<tr
										key={i}
										className="border-b border-slate-100 dark:border-slate-800"
									>
										<td className="p-3 font-medium">{row.criteria}</td>
										<td className="p-3 text-red-700 dark:text-red-400">
											{row.before}
										</td>
										<td className="p-3 text-green-700 dark:text-green-400">
											{row.after}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Section>

				{/* 7. Mülakat Soruları */}
				<Section title="7. Mülakat Soruları" icon="💬">
					<div className="space-y-4">
						{interviewQuestions.map((q, i) => (
							<div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
								<p className="font-medium text-slate-800 dark:text-white">
									Q{i + 1}: {q.question}
								</p>
								<p className="text-xs text-slate-500 italic mb-2">
									{q.questionEn}
								</p>
								<div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg mt-2">
									<p className="text-sm text-slate-700 dark:text-slate-200">
										<strong>Cevap:</strong> {q.answer}
									</p>
									<p className="text-xs text-slate-500 italic mt-1">
										{q.answerEn}
									</p>
								</div>
							</div>
						))}
					</div>

					{/* Tuzaklar */}
					<div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
						<h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
							🪤 Dikkat! Tuzak Sorular / Pitfalls
						</h3>
						<ul className="space-y-1">
							{pitfalls.map((pitfall, i) => (
								<li
									key={i}
									className="text-sm text-slate-700 dark:text-slate-300"
								>
									• {pitfall}
								</li>
							))}
						</ul>
					</div>
				</Section>

				{/* 8. Mini Ödev */}
				<Section title="8. Mini Ödev (10 dakika)" icon="📝">
					<div className="space-y-4">
						<p className="text-slate-700 dark:text-slate-300">
							{miniTask.description}
						</p>
						<div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
							<p className="text-sm text-blue-700 dark:text-blue-300">
								<strong>💡 İpucu:</strong> {miniTask.hint}
							</p>
						</div>
					</div>
				</Section>
			</div>
		</div>
	);
}
