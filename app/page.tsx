import type { Metadata } from "next";
import Link from "next/link";
import { ContactBand, PageShell, SectionHeading } from "./components";
import { DataVisual } from "./DirectionNav";
import { sitePath } from "./site-path";

export const metadata: Metadata = {
  title: { absolute: "Архивум — оцифровка, данные и программные решения" },
  description: "Превращаем информацию в работающие данные. Оцифровка, структурирование информации, автоматизация и разработка прикладных программных решений.",
};

export default function Home() {
  return (
    <PageShell>
      <section className="company-hero">
        <div className="shell">
          <p className="eyebrow">Архивум · информация · технологии</p>
          <h1>Превращаем информацию<br /><em>в работающие данные</em></h1>
          <p className="company-lead">От бумажных документов до цифровых массивов. Оцифровка, структурирование, автоматизация и разработка программных решений.</p>
        </div>
      </section>
      <section className="company-directions shell" aria-label="Два направления работы">
        <Link href="/digitization" className="direction-card">
          <div className="direction-art"><img src={sitePath("/assets/hero-planetary-scanner.webp")} alt="Оцифровка книги на планетарном сканере" /></div>
          <div className="direction-copy"><p className="eyebrow">01 / Оригиналы и цифровые фонды</p><h2>Оцифровка и<br />архивные технологии</h2><p>Оцифровка книг, документов, периодики и архивных фондов. От бережной съёмки оригиналов до подготовки электронных коллекций.</p><span className="direction-action">Перейти к оцифровке <b aria-hidden="true">↗</b></span></div>
        </Link>
        <Link href="/software" className="direction-card">
          <div className="direction-art"><DataVisual /></div>
          <div className="direction-copy"><p className="eyebrow">02 / Данные и рабочие процессы</p><h2>Данные и<br />программные решения</h2><p>Обработка массивов данных, автоматизация документов и рабочих процессов, разработка прикладных программных решений.</p><span className="direction-action">Перейти к разработке <b aria-hidden="true">↗</b></span></div>
        </Link>
      </section>
      <section className="section company-experience">
        <div className="shell company-experience-grid">
          <SectionHeading eyebrow="Единая инженерная компетенция" title="Знаем, что происходит с информацией на практике" text="В проектах оцифровки мы работаем со сложными документными массивами: распознаём, проверяем, связываем файлы с описаниями и готовим данные для информационных систем. Этот опыт лежит в основе программного направления." />
          <div className="company-experience-note"><span>От оригинала до системы</span><p>Файловый массив предприятия, документы библиотеки или повторяющиеся операции торговой компании — начинаем с задачи и требований к результату.</p><Link className="text-link" href="/experience">Смотреть выполненные проекты →</Link></div>
        </div>
      </section>
      <ContactBand title="Какая задача стоит перед вами?" text="Оцифровать фонд, привести в порядок 100 000 файлов или автоматизировать рабочий процесс. Расскажите об исходных данных и нужном результате — обсудим подход." />
    </PageShell>
  );
}
