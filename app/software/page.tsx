import type { Metadata } from "next";
import Link from "next/link";
import { ContactBand, PageShell, RelatedCases, SectionHeading } from "../components";
import { DataVisual, DirectionNav } from "../DirectionNav";
import { softwareCapabilities } from "./content";

export const metadata: Metadata = { title: "Данные и программные решения", description: "Разработка программных решений для обработки данных и автоматизации рабочих процессов. Файловые массивы, OCR, PDF и прикладные инструменты." };

export default function SoftwarePage() {
  return <PageShell>
    <DirectionNav current="software" />
    <section className="software-hero">
      <div className="shell software-hero-grid"><div><p className="eyebrow">Данные и программные решения</p><h1>Программные решения для сложных задач <em>с данными</em></h1><p className="company-lead">Разрабатываем инструменты для обработки информации, автоматизации документов и повторяющихся процессов. От специализированных скриптов до прикладных программ.</p><div className="button-row"><Link className="button" href="/contact">Обсудить задачу</Link><Link className="text-link" href="/software/products">Собственные разработки →</Link></div></div><DataVisual /></div>
    </section>
    <section className="section section-paper"><div className="shell"><SectionHeading eyebrow="Компетенции" title="Три точки приложения разработки" text="Работаем там, где нужно упорядочить информацию, обработать документы или убрать повторяющиеся операции из рабочего дня." /><div className="software-capability-grid">{softwareCapabilities.map(item => <Link className="software-capability-card" href={`/software/${item.slug}`} key={item.slug}><span className="card-number">{item.number}</span><h3>{item.title}</h3><p>{item.short}</p><span className="text-link">Задачи и подход →</span></Link>)}</div></div></section>
    <section className="section"><div className="shell company-experience-grid"><SectionHeading eyebrow="04 / Собственные разработки" title="Инструменты, выросшие из конкретных задач" text="Обработка PDF и OCR, файловые операции, работа с закупками и мобильное приложение «Хвать». У каждой разработки — свой этап готовности и назначение." /><div className="company-experience-note"><p>Производственные инструменты, прототипы и проекты в разработке представлены отдельно. Возможность адаптации обсуждаем под вашу задачу.</p><Link className="button" href="/software/products">Смотреть разработки</Link></div></div></section>
    <section className="section home-capabilities"><div className="shell home-capabilities-grid"><div><p className="eyebrow eyebrow-light">Как строим работу</p><h2>Сначала проверяем задачу на реальных данных</h2></div><div className="home-capability-list">{[
      ["01", "Разбираем процесс", "Фиксируем входные данные, ограничения, ручные операции и критерии приёмки."],
      ["02", "Проверяем на выборке", "Согласуем правила и проверяем ключевые операции на характерных примерах до обработки всего массива."],
      ["03", "Согласуем реализацию", "Определяем состав инструмента, формат результата, порядок запуска и условия сопровождения."],
    ].map(([n,title,text]) => <article key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>
    <section className="section software-practice-intro"><div className="shell"><SectionHeading eyebrow="Производственная основа" title="Архивные проекты — опыт работы с данными" text="В этих проектах видны реальные задачи: распознавание, структура файлов, заполнение карточек и подготовка массивов для систем. Программные инструменты применяем и развиваем на этой инженерной основе." /></div></section>
    <RelatedCases slugs={["shalya", "database-flow"]} />
    <ContactBand title="Где у вас начинается ручная работа?" text="Покажите пример файлов, документа или повторяющейся операции. Обсудим, что можно автоматизировать, как проверить результат и с какого этапа начать." />
  </PageShell>;
}
