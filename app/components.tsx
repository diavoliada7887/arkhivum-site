import { sitePath } from "./site-path";
import Link from "next/link";
import {
  cases,
  serviceMenuGroups,
  services,
  type CaseStudy,
} from "./content";
import { DesktopNav } from "./DesktopNav";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Архивум — на главную">
      <span className="brand-mark" aria-hidden="true">
        А
      </span>
      <span>
        <strong>АРХИВУМ</strong>
        <small>цифровое наследие</small>
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <DesktopNav />
        <Link className="button button-small" href="/contact">
          Обсудить проект
        </Link>
        <details className="mobile-nav">
          <summary aria-label="Открыть меню">Меню</summary>
          <div className="mobile-nav-panel">
            <details className="mobile-services-menu">
              <summary>
                Услуги
                <span aria-hidden="true">+</span>
              </summary>
              <div>
                <Link className="mobile-services-all" href="/services">
                  Все услуги
                </Link>
                {serviceMenuGroups.map((group) => (
                  <section className="mobile-services-group" key={group.title}>
                    <p>{group.title}</p>
                    {group.services.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                      >
                        {service.title}
                      </Link>
                    ))}
                    {group.extraLinks.map((item) => (
                      <Link key={item.href} href={item.href}>
                        {item.title}
                      </Link>
                    ))}
                  </section>
                ))}
              </div>
            </details>
            <Link href="/experience">Опыт работ</Link>
            <Link href="/equipment">Оборудование</Link>
            <Link href="/about">О компании</Link>
            <Link href="/prices">Цены</Link>
            <Link href="/contact">Обсудить проект</Link>
          </div>
        </details>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p className="footer-intro">
            Оцифровываем культурное наследие и превращаем большие документные
            массивы в работающие цифровые фонды.
          </p>
        </div>
        <div>
          <p className="footer-title">Направления</p>
          <Link href="/services/books">Книги</Link>
          <Link href="/services/newspapers">Газеты</Link>
          <Link href="/services/archival-files">Архивные фонды</Link>
          <Link href="/services/databases-integrations">Базы данных</Link>
        </div>
        <div>
          <p className="footer-title">О компании</p>
          <Link href="/experience">Опыт работ</Link>
          <Link href="/equipment">Оборудование</Link>
          <Link href="/prices">Цены</Link>
          <Link href="/about">О нас</Link>
        </div>
        <div>
          <p className="footer-title">Связаться</p>
          <a href="mailto:sale@predikt.ru">sale@predikt.ru</a>
          <a href="tel:+79321211027">+7 932 121-10-27</a>
          <span>Работаем по всей России</span>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Архивум</span>
        <span>Бережно к оригиналу. Точно к данным.</span>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text && <p className="section-lead">{text}</p>}
    </div>
  );
}

export function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[number];
  index: number;
}) {
  return (
    <Link className="service-card" href={`/services/${service.slug}`}>
      <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <p className="eyebrow">{service.eyebrow}</p>
        <h3>{service.title}</h3>
        <p>{service.short}</p>
      </div>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}

export function CaseCard({
  item,
  featured = false,
}: {
  item: CaseStudy;
  featured?: boolean;
}) {
  return (
    <Link
      className={`case-card${featured ? " case-card-featured" : ""}`}
      href={`/experience/${item.slug}`}
    >
      {item.hero ? (
        <div className="case-image">
          <img src={sitePath(item.hero)} alt="" />
        </div>
      ) : (
        <div className="case-image case-image-placeholder">
          <span>{item.visualLabel ?? "Фотография проекта"}</span>
        </div>
      )}
      <div className="case-copy">
        <p className="eyebrow">{item.category}</p>
        <h3>{item.title}</h3>
        <p>{item.short}</p>
        <span className="text-link">Подробнее →</span>
      </div>
    </Link>
  );
}

export function ContactBand({
  title = "Обсудим ваш фонд?",
  text = "Расскажите, что хранится у вас, в каком объёме и какой результат нужен. Предложим технологию и состав работ.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="contact-band">
      <div className="shell contact-band-inner">
        <div>
          <p className="eyebrow eyebrow-light">Следующий проект</p>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <Link className="button button-light" href="/contact">
          Обсудить задачу
        </Link>
      </div>
    </section>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
          {index < items.length - 1 && <b>/</b>}
        </span>
      ))}
    </nav>
  );
}

export function RelatedCases({ slugs }: { slugs: string[] }) {
  const selected = slugs
    .map((slug) => cases.find((item) => item.slug === slug))
    .filter((item): item is CaseStudy => Boolean(item));

  return (
    <section className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="Практика"
          title="Так мы решаем похожие задачи"
        />
        <div className="case-grid">
          {selected.map((item) => (
            <CaseCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
