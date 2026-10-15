import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, ContactBand, PageShell } from "../../components";
import { DirectionNav } from "../../DirectionNav";
import { CaseEvidence, ProductTeaser } from "../Portfolio";
import { SolutionVisual } from "../SolutionVisual";
import type { VisualKey } from "../visuals";
import { softwareProducts } from "../products";
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
const visuals: Record<string, VisualKey> = {
  "data-processing": "sboeboy",
  "databases-integrations": "databases-integrations",
  "server-solutions": "server-solutions",
  "document-automation": "pdfa-pipeline",
  "workflow-automation": "source-monitoring",
};

export default async function CapabilityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = softwareCapabilities.find((item) => item.slug === slug);
  if (!item) notFound();
  const products = softwareProducts
    .filter((p) => p.capabilities.includes(slug))
    .slice(0, 2);
  return (
    <PageShell>
      <div className="software-surface capability-page">
        <DirectionNav current="software" />
        <section className="product-hero shell">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Данные и ПО", href: "/software" },
              { label: item.title },
            ]}
          />
          <div className="product-hero-grid">
            <div className="product-intro">
              <p className="eyebrow">{item.number} / Компетенции</p>
              <h1>{item.title}</h1>
              <p className="product-benefit">{item.lead}</p>
              <Link className="button" href="/contact">
                Обсудить задачу
              </Link>
            </div>
            <SolutionVisual kind={visuals[slug]} priority />
          </div>
        </section>
        <section className="section capability-spec">
          <div className="shell product-how-grid">
            <div>
              <p className="eyebrow">Состав работ</p>
              <h2>Что можем взять на себя</h2>
              <ul className="product-function-list">
                {item.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
            <dl className="capability-io">
              <div>
                <dt>Что нужно для оценки</dt>
                <dd>{item.input}</dd>
              </div>
              <div>
                <dt>Что согласуем в результате</dt>
                <dd>{item.output}</dd>
              </div>
            </dl>
          </div>
        </section>
        <section
          className={`section capability-evidence${slug === "server-solutions" ? " capability-evidence-dark" : ""}`}
        >
          <div className="shell">
            <div className="evidence-copy">
              <div>
                <p className="eyebrow">
                  {slug === "databases-integrations"
                    ? "Подтверждённый опыт"
                    : "Практика и сценарий"}
                </p>
                <h2>
                  {slug === "server-solutions"
                    ? "Рабочий процесс — от исходников до выдачи"
                    : "Как это выглядит в работе"}
                </h2>
              </div>
              <div>
                <p>{item.example}</p>
                {slug !== "databases-integrations" && (
                  <p className="scenario-label">
                    Сценарий для обсуждения; состав решения определяется
                    задачей.
                  </p>
                )}
                {slug === "server-solutions" && (
                  <p>
                    <strong>
                      Практическая основа: более 50 ТБ собственной
                      инфраструктуры хранения.
                    </strong>{" "}
                    Объём не означает наличие публичной облачной платформы или
                    круглосуточного SLA.{" "}
                    <Link className="text-link" href="/equipment">
                      Оборудование →
                    </Link>
                  </p>
                )}
              </div>
            </div>
            {slug === "databases-integrations" && <CaseEvidence />}
            <div className="demonstration-cta">
              <span>{item.result}</span>
              <Link className="text-link" href="/contact">
                Обсудить ваш массив →
              </Link>
            </div>
          </div>
        </section>
        {products.length > 0 && (
          <section className="section">
            <div className="shell">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Подтверждение компетенции</p>
                  <h2>Инструменты для таких задач</h2>
                </div>
                <Link className="text-link" href="/software/products">
                  Всё портфолио →
                </Link>
              </div>
              <div className="featured-products">
                {products.map((product) => (
                  <ProductTeaser key={product.slug} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}
        <ContactBand
          title="Разберём вашу задачу на примере"
          text="Покажите исходные данные и ожидаемый результат — обсудим подход и состав работ."
        />
      </div>
    </PageShell>
  );
}
