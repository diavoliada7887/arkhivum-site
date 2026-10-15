import type { Metadata } from "next";
import Link from "next/link";
import { ContactBand, PageShell, SectionHeading } from "./components";
import { sitePath } from "./site-path";

export const metadata: Metadata = {
  title: { absolute: "Архивум — оцифровка и разработка программного обеспечения" },
  description:
    "Сохраняем ценное. Создаём новое. Оцифровка и архивные технологии, разработка ПО, обработка данных и автоматизация процессов.",
};

export default function Home() {
  return (
    <PageShell>
      <section className="company-hero">
        <div className="shell">
          <p className="eyebrow">Архивум · информация · технологии</p>
          <h1>
            Сохраняем ценное.
            <br />
            <em>Создаём новое.</em>
          </h1>
          <nav
            className="home-quick-directions"
            aria-label="Выбрать направление"
          >
            <Link href="/digitization">
              Оцифровка <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/software">
              Разработка ПО <span aria-hidden="true">↗</span>
            </Link>
          </nav>
          <p className="company-lead">
            Оцифровка и архивные технологии. Разработка программного обеспечения,
            обработка данных и автоматизация процессов.
          </p>
        </div>
      </section>
      <section
        className="company-directions shell"
        aria-label="Два направления работы"
      >
        <Link href="/digitization" className="direction-card">
          <div className="direction-art">
            <img
              src={sitePath("/assets/hero-planetary-scanner.webp")}
              alt="Оцифровка книги на планетарном сканере"
            />
          </div>
          <div className="direction-copy">
            <p className="eyebrow">01 / Оригиналы и цифровые фонды</p>
            <h2>
              Оцифровка и<br />
              архивные технологии
            </h2>
            <p>
              Оцифровка книг, документов, периодики и архивных фондов. От
              бережной съёмки оригиналов до подготовки электронных коллекций.
            </p>
            <span className="direction-action">
              Перейти к оцифровке <b aria-hidden="true">↗</b>
            </span>
          </div>
        </Link>
        <Link href="/software" className="direction-card">
          <div className="direction-art direction-art--software-photo">
            {/* Chris Ried / Unsplash, free to use under the Unsplash License. */}
            <img
              src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&amp;fit=crop&amp;w=1600&amp;q=85"
              alt="Экран компьютера с программным кодом"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="direction-copy">
            <p className="eyebrow">02 / Программная инженерия</p>
            <h2>
              Разработка ПО<br />
              и автоматизация
            </h2>
            <p>
              Разрабатываем прикладные программы, инструменты обработки данных и
              системы автоматизации. От специализированных утилит до
              комплексных программных решений.
            </p>
            <span className="direction-action">
              Перейти к разработке <b aria-hidden="true">↗</b>
            </span>
          </div>
        </Link>
      </section>
      <section className="section company-experience">
        <div className="shell company-experience-grid">
          <SectionHeading
            eyebrow="Единая инженерная компетенция"
            title="Знаем, что происходит с информацией на практике"
            text="В проектах оцифровки мы работаем со сложными документными массивами: распознаём, проверяем, связываем файлы с описаниями и готовим данные для информационных систем. Этот опыт лежит в основе программного направления."
          />
          <div className="company-experience-note">
            <span>От оригинала до системы</span>
            <p>
              Файловый массив предприятия, документы библиотеки или
              повторяющиеся операции торговой компании — начинаем с задачи и
              требований к результату.
            </p>
            <Link className="text-link" href="/experience">
              Смотреть выполненные проекты →
            </Link>
          </div>
        </div>
      </section>
      <ContactBand
        title="Какая задача стоит перед вами?"
        text="Оцифровать фонд, привести в порядок 100 000 файлов или автоматизировать рабочий процесс. Расскажите об исходных данных и нужном результате — обсудим подход."
      />
    </PageShell>
  );
}
