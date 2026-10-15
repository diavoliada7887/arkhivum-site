import type { Metadata } from "next";
import Link from "next/link";
import { DirectionNav } from "../DirectionNav";
import { ContactBand, PageShell, ServiceCard } from "../components";
import { digitizationServices } from "../content";

export const metadata: Metadata = {
  title: "Услуги оцифровки и архивной обработки",
  description:
    "Оцифровка книг, газет, документов, упорядочивание и переплёт. Базы данных и программная разработка — в самостоятельном направлении.",
};

export default function ServicesPage() {
  return (
    <PageShell>
      <DirectionNav current="digitization" />
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow">Услуги</p>
            <h1>Полный цикл работы с бумажным и цифровым фондом</h1>
          </div>
          <p>
            Работа с материальными оригиналами: сканирование, архивная
            обработка, упорядочивание и переплёт. Данные, базы и программы
            представлены в самостоятельном направлении.
          </p>
        </div>
      </section>
      <section className="section section-paper">
        <div className="shell service-list">
          {digitizationServices.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <p className="eyebrow">Данные и программные решения</p>
          <h2>Нужна база данных или автоматизация?</h2>
          <p>
            Цифровые копии могут стать основой базы, поиска и обмена с
            информационными системами.
          </p>
          <Link className="button" href="/software">
            Перейти к инженерным решениям
          </Link>
        </div>
      </section>
      <ContactBand />
    </PageShell>
  );
}
