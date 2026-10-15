import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  ContactBand,
  PageShell,
  SectionHeading,
} from "../../components";
import { DirectionNav } from "../../DirectionNav";
import { SolutionVisual } from "../SolutionVisual";
import { EngineeringEntry } from "../Portfolio";
import { softwareProducts } from "../products";

export const metadata: Metadata = {
  title: "Инженерные решения и собственные приложения",
  description:
    "Контроль файловых массивов, конвейер PDF/A, извлечение реквизитов, навигация PDF, обработка изображений и мониторинг. Собственные приложения «Хвать», «Профицит» и RPG Life.",
};

export default function ProductsPage() {
  const engineering = softwareProducts.filter((p) => p.group === "engineering");
  const applications = softwareProducts.filter(
    (p) => p.group === "applications",
  );
  return (
    <PageShell>
      <div className="software-surface portfolio-page">
        <DirectionNav current="software" />
        <section className="page-hero">
          <div className="shell">
            <Breadcrumbs
              items={[
                { label: "Главная", href: "/" },
                { label: "Данные и ПО", href: "/software" },
                { label: "Инженерное портфолио" },
              ]}
            />
            <div className="page-hero-grid">
              <div>
                <p className="eyebrow">От задачи до работающего инструмента</p>
                <h1>Инженерные решения и собственные приложения</h1>
              </div>
              <div>
                <p className="section-lead">
                  Технологии, выросшие из реальных производственных задач.
                  Показываем, что поступает на вход, как устроена обработка и
                  какой результат можно проверить.
                </p>
                <nav
                  className="portfolio-local-nav"
                  aria-label="Разделы портфолио"
                >
                  <a href="#engineering">Производственные технологии ↓</a>
                  <a href="#applications">Собственные приложения ↓</a>
                </nav>
              </div>
            </div>
          </div>
        </section>
        <section className="section portfolio-engineering" id="engineering">
          <div className="shell">
            <SectionHeading
              eyebrow="I / Производственные технологии"
              title="Решения для файлов, документов и информации"
              text="Работа с массивами, документами и внешней информацией. Выберите задачу, чтобы увидеть принцип и возможности адаптации."
            />
            <div className="portfolio-solution-grid">
              {engineering.map((product, index) => (
                <EngineeringEntry
                  key={product.slug}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
        <section className="section portfolio-applications" id="applications">
          <div className="shell">
            <SectionHeading
              eyebrow="II / Прикладная разработка"
              title="Собственные приложения и экспериментальные проекты"
              text="Отдельные продукты показывают опыт мобильной и веб-разработки, расчётов, пользовательских сценариев и хранения состояния."
            />
            <div className="application-grid">
              {applications.map((product) => (
                <article className="application-entry" key={product.slug}>
                  <Link
                    href={`/software/products/${product.slug}`}
                    className="product-visual-link"
                    aria-label={`Подробнее: ${product.title}`}
                  >
                    <SolutionVisual kind={product.slug} compact />
                  </Link>
                  <div className="application-entry-copy">
                    <p className="eyebrow">{product.label}</p>
                    <h2>{product.title}</h2>
                    <p>{product.benefit}</p>
                    <p className="application-status">{product.status}</p>
                    <Link
                      className="text-link"
                      href={`/software/products/${product.slug}`}
                    >
                      О приложении →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <ContactBand
          title="Какой процесс нужно изменить у вас?"
          text="Обсудим исходный массив, правила и критерии приёмки. Предложим адаптацию имеющейся технологии или отдельную разработку по заданию."
        />
      </div>
    </PageShell>
  );
}
