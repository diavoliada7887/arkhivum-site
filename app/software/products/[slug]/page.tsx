import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, ContactBand, PageShell } from "../../../components";
import { DirectionNav } from "../../../DirectionNav";
import { softwareProducts } from "../../products";
import { softwareCapabilities } from "../../content";
import { SolutionVisual } from "../../SolutionVisual";

export const dynamicParams = false;
export function generateStaticParams() {
  return softwareProducts.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = softwareProducts.find((p) => p.slug === slug);
  return product
    ? {
        title: `${product.label} — ${product.title}`,
        description: product.problem,
      }
    : {};
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = softwareProducts.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <PageShell>
      <div className={`software-surface product-page product-page-${p.group}`}>
        <DirectionNav current="software" />
        <section className="product-hero shell">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Данные и ПО", href: "/software" },
              { label: "Портфолио", href: "/software/products" },
              { label: p.label },
            ]}
          />
          <div className="product-hero-grid">
            <div className="product-intro">
              <p className="eyebrow">{p.label}</p>
              <h1>{p.title}</h1>
              <p className="product-benefit">{p.benefit}</p>
              <p className="engineering-status">{p.status}</p>
              <Link className="button" href="/contact">
                Обсудить адаптацию
              </Link>
            </div>
            <SolutionVisual kind={p.slug} priority />
          </div>
          <div className="demonstration-cta">
            <span>{p.cooperation}</span>
            <Link className="text-link" href="/contact">
              Обсудить свой сценарий →
            </Link>
          </div>
        </section>
        <section className="section product-how">
          <div className="shell product-how-grid">
            <div>
              <p className="eyebrow">Инженерный принцип</p>
              <h2>Как это работает</h2>
              <p>{p.principle}</p>
            </div>
            <div>
              <p className="eyebrow">Подтверждённые функции</p>
              <h2>Что уже реализовано</h2>
              <ul className="product-function-list">
                {p.functions.map((fn) => (
                  <li key={fn}>{fn}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="section product-result-section">
          <div className="shell">
            <dl className="product-result-grid">
              <div>
                <dt>Входные данные</dt>
                <dd>{p.input}</dd>
              </div>
              <div>
                <dt>Выходной результат</dt>
                <dd>{p.output}</dd>
              </div>
            </dl>
          </div>
        </section>
        <section className="section product-application">
          <div className="shell product-application-grid">
            <div>
              <p className="eyebrow">Применение и готовность</p>
              <h2>Где применяется</h2>
              <p>{p.application}</p>
            </div>
            <div>
              <h3>Возможности адаптации</h3>
              <p>
                {p.cooperation}. Начинаем с примера исходных данных и требований
                к результату.
              </p>
              <details className="adaptation-details">
                <summary>Условия и границы применения</summary>
                <p>{p.limitation}</p>
              </details>
              {p.note && (
                <details className="adaptation-details">
                  <summary>LimbusTailor: исходный проект и GPL-3.0</summary>
                  <p>{p.note}</p>
                  <a
                    className="text-link"
                    href="https://github.com/trufanov-nok/scantailor-universal"
                  >
                    ScanTailor Universal →
                  </a>
                  <br />
                  <a
                    className="text-link"
                    href="https://www.gnu.org/licenses/gpl-3.0.html"
                  >
                    Условия GPL-3.0 →
                  </a>
                </details>
              )}
            </div>
          </div>
          <nav
            className="shell product-related-nav"
            aria-label="Связанные компетенции"
          >
            {p.capabilities.map((slug) => {
              const c = softwareCapabilities.find((c) => c.slug === slug);
              return c ? (
                <Link href={`/software/${slug}`} key={slug}>
                  {c.title} →
                </Link>
              ) : null;
            })}
            <Link href="/software/products">Всё портфолио →</Link>
          </nav>
        </section>
        <ContactBand
          title="Покажите вашу задачу"
          text="Обсудим исходные данные, ожидаемый результат и подход к адаптации."
        />
      </div>
    </PageShell>
  );
}
