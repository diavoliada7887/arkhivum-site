import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  ContactBand,
  PageShell,
  SectionHeading,
  RelatedCases,
} from "../../components";
import { DirectionNav } from "../../DirectionNav";
import { TechnicalFlow, ProductTeaser } from "../Portfolio";
import { softwareProducts } from "../products";
import { sitePath } from "../../site-path";
import { softwareCapabilities } from "../content";

export const dynamicParams = false;
export function generateStaticParams() {
  return softwareCapabilities.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = softwareCapabilities.find((item) => item.slug === slug);
  return item ? { title: item.title, description: item.short } : {};
}
export default async function CapabilityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = softwareCapabilities.find((item) => item.slug === slug);
  if (!item) notFound();
  return (
    <PageShell>
      <DirectionNav current="software" />
      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Данные и ПО", href: "/software" },
              { label: item.title },
            ]}
          />
          <div className="page-hero-grid">
            <div>
              <p className="eyebrow">{item.number} / Компетенции</p>
              <h1>{item.title}</h1>
            </div>
            <p>{item.lead}</p>
          </div>
        </div>
      </section>
      <section className="section section-paper">
        <div className="shell story-grid">
          <SectionHeading
            eyebrow="Состав работ"
            title="Что можем взять на себя"
          />
          <ul className="work-list">
            {item.tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section">
        <div className="shell story-grid">
          <SectionHeading
            eyebrow={
              slug === "databases-integrations"
                ? "Реальный опыт"
                : "Пример задачи"
            }
            title="Как это выглядит в работе"
          />
          <div className="software-example">
            <p>{item.example}</p>
            <strong>{item.result}</strong>
            {slug !== "databases-integrations" && (
              <p className="software-example-note">
                Пример сценария для обсуждения, а не отдельный завершённый
                клиентский кейс.
              </p>
            )}
          </div>
        </div>
      </section>
      {slug === "databases-integrations" && (
        <>
          <section className="section database-principle">
            <div className="shell">
              <SectionHeading
                eyebrow="Модель данных"
                title="Записи, справочники и файлы — в одной структуре"
              />
              <TechnicalFlow
                steps={[
                  "Справочники",
                  "Карточка документа",
                  "Связь с файлом",
                  "Поиск / обмен",
                ]}
                caption="Упрощённая схема связей, не интерфейс конкретной базы"
              />
            </div>
          </section>
          <RelatedCases slugs={["shalya", "database-flow"]} />
        </>
      )}
      {slug === "server-solutions" && (
        <section className="section home-capabilities">
          <div className="shell server-evidence">
            <img
              src={sitePath("/assets/equipment/server-storage.webp")}
              alt="Серверные системы хранения из существующего каталога оборудования"
            />
            <div>
              <p className="eyebrow eyebrow-light">Практическая основа</p>
              <h2>Более 50 ТБ собственной инфраструктуры хранения</h2>
              <p>
                Объём относится к существующей инфраструктуре компании. Это не
                предложение облачного хостинга, сертифицированного защищённого
                хранения или круглосуточного SLA.
              </p>
              <Link className="text-link" href="/equipment">
                Оборудование и хранение →
              </Link>
            </div>
          </div>
          <div className="shell">
            <TechnicalFlow
              steps={[
                "Исходные файлы",
                "Рабочая партия",
                "Программная обработка",
                "Результат / передача",
              ]}
              caption="Принцип организации процесса; конкретную инфраструктуру согласуем отдельно"
            />
          </div>
        </section>
      )}
      <section className="section section-paper">
        <div className="shell software-io-grid">
          <article>
            <p className="eyebrow">На входе</p>
            <h2>Что нужно для оценки</h2>
            <p>{item.input}</p>
          </article>
          <article>
            <p className="eyebrow">На выходе</p>
            <h2>Что согласуем в результате</h2>
            <p>{item.output}</p>
          </article>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <SectionHeading eyebrow="Дальше" title="Смежные задачи" />
          <div className="software-capability-grid">
            {softwareCapabilities
              .filter((other) => other.slug !== slug)
              .map((other) => (
                <Link
                  className="software-capability-card"
                  key={other.slug}
                  href={`/software/${other.slug}`}
                >
                  <h3>{other.title}</h3>
                  <p>{other.short}</p>
                  <span className="text-link">Подробнее →</span>
                </Link>
              ))}
            <Link
              className="software-capability-card"
              href="/software/products"
            >
              <h3>Собственные разработки</h3>
              <p>
                Производственные инструменты, прототипы и прикладные программы.
              </p>
              <span className="text-link">Смотреть разработки →</span>
            </Link>
          </div>
        </div>
      </section>
      {softwareProducts.some((p) => p.capabilities.includes(slug)) && (
        <section className="section section-paper">
          <div className="shell">
            <SectionHeading
              eyebrow="Подтверждение компетенции"
              title="Инструменты для таких задач"
            />
            <div className="featured-products">
              {softwareProducts
                .filter((p) => p.capabilities.includes(slug))
                .slice(0, 4)
                .map((product) => (
                  <ProductTeaser key={product.slug} product={product} />
                ))}
            </div>
          </div>
        </section>
      )}
      <ContactBand
        title="Разберём вашу задачу на примере"
        text="Опишите исходные данные, объём и ожидаемый результат. Для первого обсуждения подойдёт обезличенная выборка и описание текущего процесса."
      />
    </PageShell>
  );
}
