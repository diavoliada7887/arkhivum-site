import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  ContactBand,
  PageShell,
  SectionHeading,
} from "../../../components";
import { DirectionNav } from "../../../DirectionNav";
import { softwareProducts } from "../../products";
import { softwareCapabilities } from "../../content";
import { TechnicalFlow } from "../../Portfolio";

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
      <DirectionNav current="software" />
      <section className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Данные и ПО", href: "/software" },
              { label: "Портфолио", href: "/software/products" },
              { label: p.label },
            ]}
          />
          <div className="page-hero-grid">
            <div>
              <p className="eyebrow">{p.label}</p>
              <h1>{p.title}</h1>
              <p className="engineering-status">{p.status}</p>
            </div>
            <div>
              <p className="section-lead">{p.problem}</p>
              <p className="engineering-cooperation">{p.cooperation}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section product-principle">
        <div className="shell">
          <div className="story-grid">
            <SectionHeading
              eyebrow="Инженерный принцип"
              title="Как устроено решение"
            />
            <p className="section-lead">{p.principle}</p>
          </div>
          <TechnicalFlow steps={p.flow} />
        </div>
      </section>
      <section className="section section-paper">
        <div className="shell story-grid">
          <SectionHeading eyebrow="Функции" title="Что реализовано" />
          <ul className="work-list">
            {p.functions.map((fn) => (
              <li key={fn}>{fn}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section">
        <div className="shell software-io-grid">
          <article>
            <p className="eyebrow">Входные данные</p>
            <h2>С чем работает инструмент</h2>
            <p>{p.input}</p>
          </article>
          <article>
            <p className="eyebrow">Выходной результат</p>
            <h2>Что получаем после обработки</h2>
            <p>{p.output}</p>
          </article>
        </div>
      </section>
      <section className="section section-paper">
        <div className="shell story-grid">
          <SectionHeading
            eyebrow="Применение и готовность"
            title="Где подтверждён опыт и что требует проверки"
          />
          <div className="software-example">
            <p>{p.application}</p>
            <p>{p.limitation}</p>
            {p.note && (
              <aside className="attribution-note">
                <p>{p.note}</p>
                <a
                  className="text-link"
                  href="https://github.com/trufanov-nok/scantailor-universal"
                >
                  Исходный ScanTailor Universal →
                </a>
                <br />
                <a
                  className="text-link"
                  href="https://www.gnu.org/licenses/gpl-3.0.html"
                >
                  Условия GPL-3.0 →
                </a>
              </aside>
            )}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <SectionHeading
            eyebrow="Связанные компетенции"
            title="Какие задачи решаем на этой основе"
          />
          <div className="capability-crosslinks">
            {p.capabilities.map((slug) => {
              const c = softwareCapabilities.find((c) => c.slug === slug);
              return c ? (
                <Link
                  className="text-link"
                  href={`/software/${slug}`}
                  key={slug}
                >
                  {c.title} →
                </Link>
              ) : null;
            })}
          </div>
          <Link className="button" href="/software/products">
            Все инженерные решения
          </Link>
        </div>
      </section>
      <ContactBand
        title="Проверим подход на вашем материале"
        text="Пришлите обезличенный пример и опишите нужный результат. Обсудим применимость, адаптацию и критерии проверки. Условия поставки и сопровождения согласуем отдельно."
      />
    </PageShell>
  );
}
