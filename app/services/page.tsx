import { ContactBand, PageShell, ServiceCard } from "../components";
import { services } from "../content";

export default function ServicesPage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow">Услуги</p>
            <h1>Полный цикл работы с бумажным и цифровым фондом</h1>
          </div>
          <p>
            Восемь самостоятельных направлений — от планетарной съёмки и
            переплёта до программных решений и загрузки данных во внешнюю АИС.
          </p>
        </div>
      </section>
      <section className="section section-paper">
        <div className="shell service-list">
          {services.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
        </div>
      </section>
      <ContactBand />
    </PageShell>
  );
}
