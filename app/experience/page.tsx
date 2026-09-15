import { CaseCard, ContactBand, PageShell } from "../components";
import { cases } from "../content";

export default function ExperiencePage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow">Опыт работ</p>
            <h1>Проекты, на которых виден наш реальный масштаб</h1>
          </div>
          <p>
            От изданий 1730 года до потоков в 1 000 страниц в час и массовой
            загрузки архивных карточек во внешние системы.
          </p>
        </div>
      </section>
      <section className="section section-paper">
        <div className="shell case-grid case-grid-catalog">
          {cases.map((item) => (
            <CaseCard key={item.slug} item={item} />
          ))}
        </div>
      </section>
      <ContactBand />
    </PageShell>
  );
}
