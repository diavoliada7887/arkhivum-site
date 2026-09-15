import { sitePath } from "../../site-path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs, ContactBand, PageShell } from "../../components";
import { caseBySlug, cases } from "../../content";

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((item) => ({ slug: item.slug }));
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = caseBySlug[slug];
  if (!item) notFound();

  return (
    <PageShell>
      <section className="case-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Опыт работ", href: "/experience" },
              { label: item.title },
            ]}
          />
          <div className="case-hero-copy">
            <p className="eyebrow">{item.category}</p>
            <h1>{item.title}</h1>
            <p>{item.lead}</p>
          </div>
        </div>
        {item.hero ? (
          <div className="shell case-hero-image">
            <img src={sitePath(item.hero)} alt="" />
          </div>
        ) : (
          <div className="shell case-hero-image case-hero-placeholder">
            <span>{item.visualLabel ?? "Фотография проекта появится здесь"}</span>
          </div>
        )}
      </section>

      <section className="case-facts">
        <div className="shell case-facts-grid">
          {item.facts.map((fact) => (
            <div key={fact.label}>
              <strong>{fact.value}</strong>
              <span>{fact.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="shell story-grid">
          <div>
            <p className="eyebrow">Задача</p>
            <h2>{item.task}</h2>
          </div>
          <div>
            <p className="eyebrow">Что сделали</p>
            <ul className="work-list">
              {item.work.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {item.context && (
        <section className="section section-paper">
          <div className="shell case-context">
            <figure className="case-context-image">
              <img src={sitePath(item.context.image)} alt={item.context.title} />
            </figure>
            <div className="case-context-copy">
              <p className="eyebrow">{item.context.eyebrow}</p>
              <h2>{item.context.title}</h2>
              <p>{item.context.text}</p>
            </div>
          </div>
        </section>
      )}

      {item.gallery.length > 0 && (
        <section className="section section-paper">
          <div
            className={`shell gallery gallery-${Math.min(item.gallery.length, 3)}`}
          >
            {item.gallery.map((image, index) => (
              <figure key={image.src}>
                <img src={sitePath(image.src)} alt={image.alt} />
                <figcaption>
                  {String(index + 1).padStart(2, "0")} · {image.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="section result-section">
        <div className="shell result-box">
          <p className="eyebrow eyebrow-light">Результат</p>
          <h2>{item.result}</h2>
          <Link className="button button-light" href="/experience">
            Другие проекты
          </Link>
        </div>
      </section>

      <ContactBand />
    </PageShell>
  );
}
