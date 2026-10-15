import type { Metadata } from "next";
import Link from "next/link";
import {
  ContactBand,
  PageShell,
  RelatedCases,
  SectionHeading,
} from "../components";
import { DataVisual, DirectionNav } from "../DirectionNav";
import { softwareCapabilities } from "./content";
import { featuredProductSlugs, softwareProducts } from "./products";
import { ProductTeaser, TechnicalFlow } from "./Portfolio";

export const metadata: Metadata = {
  title: "Данные, базы, серверные решения и автоматизация",
  description:
    "Инженерия данных, базы и интеграции, серверная обработка и хранение. Производственные технологии OCR, PDF/A, контроля файлов и прикладные программы.",
};

export default function SoftwarePage() {
  return (
    <PageShell>
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
          <DataVisual />
        </div>
      </section>
      <section className="section section-paper">
        <div className="shell">
          <SectionHeading
            eyebrow="Задачи заказчика"
            title="От отдельных файлов до системы работы с информацией"
            text="Базы данных и серверная организация — самостоятельные компетенции. Они могут дополнять обработку документов или решать задачу, в которой бумаги вообще нет."
          />
          <div className="competence-editorial">
            {softwareCapabilities.map((item) => (
              <article key={item.slug}>
                <span className="card-number">{item.number}</span>
                <div>
                  <h2>
                    <Link href={`/software/${item.slug}`}>{item.title}</Link>
                  </h2>
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
              title="Четыре инструмента — четыре конкретные задачи"
              text="Контроль файловой структуры, сборка документов, извлечение реквизитов и автоматическая навигация. Подробности показывают вход, принцип обработки, выход и границы применения."
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
      <section className="section home-capabilities">
        <div className="shell">
          <SectionHeading
            eyebrow="Инженерный подход"
            title="Правила обработки раньше массового запуска"
            text="Анализируем исходники, формализуем операции и проверяем на репрезентативной выборке. Согласуем контроль исключений, сохранность исходных данных и приёмку результата. Журналы и откат используем там, где они реализованы в инструменте."
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
              ["Юридические службы", "Документные массивы, реквизиты и поиск."],
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
      <RelatedCases slugs={["shalya", "database-flow"]} />
      <ContactBand
        title="Где у вас начинается ручная работа?"
        text="Покажите пример файлов, документа, реестра или повторяющейся операции. Обсудим технологию, ограничения и способ проверить результат."
      />
    </PageShell>
  );
}
