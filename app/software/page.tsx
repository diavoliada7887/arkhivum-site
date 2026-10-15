import type { Metadata } from "next";
import Link from "next/link";
import { ContactBand, PageShell, SectionHeading } from "../components";
import { DirectionNav } from "../DirectionNav";
import { softwareCapabilities } from "./content";
import { featuredProductSlugs, softwareProducts } from "./products";
import { SolutionVisual } from "./SolutionVisual";
import { CaseEvidence, ProductTeaser, TechnicalFlow } from "./Portfolio";

export const metadata: Metadata = {
  title: "Данные, базы, серверные решения и автоматизация",
  description:
    "Инженерия данных, базы и интеграции, серверная обработка и хранение. Производственные технологии OCR, PDF/A, контроля файлов и прикладные программы.",
};

export default function SoftwarePage() {
  return (
    <PageShell>
      <div className="software-surface software-overview">
        <DirectionNav current="software" />
        <section className="software-hero">
          <div className="shell software-hero-grid">
            <div>
              <p className="eyebrow">Данные и программные решения</p>
              <h1>
                Программные решения для сложных задач <em>с данными</em>
              </h1>
              <p className="company-lead">
                Структурируем массивы, проектируем базы, организуем хранение и
                автоматизируем обработку. От специализированной утилиты до
                последовательного производственного процесса.
              </p>
              <div className="button-row">
                <Link className="button" href="/contact">
                  Обсудить задачу
                </Link>
                <Link className="text-link" href="/software/products">
                  Инженерное портфолио →
                </Link>
              </div>
            </div>
            <SolutionVisual kind="databases-integrations" priority />
          </div>
        </section>
        <section className="section section-paper" id="competencies">
          <div className="shell">
            <SectionHeading
              eyebrow="Задачи заказчика"
              title="С чем можно обратиться"
              text="Самостоятельные компетенции для цифровых массивов и рабочих процессов — независимо от наличия бумажного архива."
            />
            <div className="competence-overview">
              {softwareCapabilities.map((item) => (
                <article key={item.slug}>
                  <span className="card-number">{item.number}</span>
                  <div>
                    <h3>
                      <Link href={`/software/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p>{item.short}</p>
                    <Link className="text-link" href={`/software/${item.slug}`}>
                      Состав работ и результат →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <div className="section-title-row">
              <SectionHeading
                eyebrow="Производственные технологии"
                title="Инструменты для конкретных задач"
                text="Показываем обработку файлов и документов на наглядных схемах."
              />
              <Link className="text-link" href="/software/products">
                Всё портфолио →
              </Link>
            </div>
            <div className="featured-products">
              {featuredProductSlugs.map((slug) => {
                const product = softwareProducts.find((p) => p.slug === slug)!;
                return <ProductTeaser key={slug} product={product} />;
              })}
            </div>
          </div>
        </section>
        <section className="section home-capabilities overview-approach">
          <div className="shell">
            <SectionHeading
              eyebrow="Инженерный подход"
              title="Сначала правила и проба — затем весь массив"
              text="Согласуем правила, проверяем их на выборке, сохраняем исходные данные и контролируем исключения."
            />
            <TechnicalFlow
              steps={[
                "Исходный массив",
                "Правила",
                "Проверка выборки",
                "Обработка",
                "Приёмка",
              ]}
              caption="Схема подхода к проекту; состав операций определяется задачей"
            />
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <SectionHeading
              eyebrow="За пределами архивной отрасли"
              title="Рынок определяется задачей с данными"
              text="Наши технологии сформировались при обработке больших документных массивов и могут быть адаптированы к другим задачам, где необходимы структурирование, проверка, преобразование и передача данных."
            />
            <p className="scenario-label">
              Ниже — возможные сценарии адаптации, а не список выполненных
              отраслевых проектов.
            </p>
            <details className="industry-details">
              <summary>
                Сценарии для промышленности, торговли, логистики и других
                отраслей
              </summary>
              <div className="industry-scenarios">
                {[
                  [
                    "Промышленность",
                    "Производственная документация, файловые массивы и справочники.",
                  ],
                  [
                    "Торговля",
                    "Каталоги, таблицы и подготовка данных для импорта.",
                  ],
                  [
                    "Логистика",
                    "Реестры, сопоставление записей и подготовка отчётности.",
                  ],
                  [
                    "Юридические службы",
                    "Документные массивы, реквизиты и поиск.",
                  ],
                  [
                    "Закупки и снабжение",
                    "Мониторинг источников, фильтры и уведомления.",
                  ],
                  [
                    "Библиотеки и архивы",
                    "Распознавание, электронные коллекции и метаданные.",
                  ],
                ].map(([title, text]) => (
                  <article key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </details>
          </div>
        </section>
        <section className="section software-practice-intro">
          <div className="shell">
            <SectionHeading
              eyebrow="Выполненные проекты"
              title="Базы данных и интеграции: подтверждённый опыт"
              text="Связи документов и файлов, формирование карточек и подготовка массивов к внешней системе. Сохраняем контекст реальных проектов и не переносим их показатели на любую будущую задачу."
            />
          </div>
        </section>
        <div className="shell overview-case-evidence">
          <CaseEvidence />
        </div>
        <ContactBand
          title="Где у вас начинается ручная работа?"
          text="Покажите пример файлов, документа, реестра или повторяющейся операции. Обсудим технологию, ограничения и способ проверить результат."
        />
      </div>
    </PageShell>
  );
}
