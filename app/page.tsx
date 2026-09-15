import { sitePath } from "./site-path";
import Link from "next/link";
import { ArchiveShelfLazy } from "./ArchiveShelfLazy";
import { CaseCard, ContactBand, PageShell, SectionHeading } from "./components";
import { cases, services } from "./content";

export default function Home() {
  const featured = ["kronstadt", "rare-books", "shalya", "saratov"]
    .map((slug) => cases.find((item) => item.slug === slug))
    .filter((item): item is (typeof cases)[number] => Boolean(item));

  return (
    <PageShell>
      <section className="hero hero-rebuilt">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Оцифровка · архивная обработка · данные</p>
            <h1>
              Оцифровываем фонды.
              <br />
              <em>Доводим до системы.</em>
            </h1>
            <p className="hero-lead">
              Книги, газеты, карты, архивные фонды и большие документные массивы.
              Сканируем, распознаём, упорядочиваем, создаём базы данных и
              загружаем результат в систему заказчика.
            </p>
            <div className="button-row">
              <Link className="button" href="/contact">
                Рассчитать проект
              </Link>
              <Link className="text-link" href="/experience">
                Смотреть опыт работ →
              </Link>
            </div>
            <div className="hero-note">
              <span>Материалы с 1730 года</span>
              <span>До 1 000 страниц в час</span>
              <span>Работаем по всей России</span>
            </div>
          </div>

          <div className="hero-scanner">
            <img
              src={sitePath("/assets/hero-planetary-scanner.webp")}
              alt="Оцифровка старой книги на планетарном сканере"
            />
            <div className="hero-scanner-caption">
              <strong>Планетарная съёмка</strong>
              <span>для книг и ветхих оригиналов</span>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip">
        <div className="shell proof-grid">
          <div>
            <strong>≈ 1 млн</strong>
            <span>страниц в выполненных проектах</span>
          </div>
          <div>
            <strong>1730</strong>
            <span>год самого раннего материала</span>
          </div>
          <div>
            <strong>до 1 000</strong>
            <span>страниц в час на потоке</span>
          </div>
          <div>
            <strong>до 5 000</strong>
            <span>карточек документов в месяц</span>
          </div>
        </div>
      </section>

      <section className="section section-paper">
        <div className="shell">
          <div className="section-title-row">
            <SectionHeading
              eyebrow="Услуги"
              title="Весь путь документа — без разрыва между подрядчиками"
              text="Можно заказать отдельный этап или полный цикл: от бумажного оригинала до поиска и загрузки данных."
            />
            <Link className="text-link" href="/services">
              Все услуги →
            </Link>
          </div>
          <div className="home-service-grid">
            {services.map((service, index) => (
              <Link
                className={`home-service-card${
                  service.homeImage ? " home-service-card-photo" : ""
                }`}
                href={`/services/${service.slug}`}
                key={service.slug}
              >
                {service.homeImage ? (
                  <img
                    className="home-service-card-background"
                    src={sitePath(service.homeImage)}
                    alt={service.homeImageAlt ?? ""}
                  />
                ) : null}
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{service.title}</h3>
                <p>{service.short}</p>
                <b>{service.price}</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ArchiveShelfLazy />

      <section className="section home-capabilities">
        <div className="shell home-capabilities-grid">
          <div>
            <p className="eyebrow">Почему не просто «сканирование»</p>
            <h2>Мы работаем и с оригиналом, и с тем, что будет после него</h2>
          </div>
          <div className="home-capability-list">
            <article>
              <span>01</span>
              <div>
                <h3>Сохранность</h3>
                <p>
                  Планетарная съёмка, V-образные колыбели и работа без вывоза
                  фонда.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Производительность</h3>
                <p>
                  Поточные линии, поэтапная приёмка и собственное хранение более
                  50 ТБ.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Данные</h3>
                <p>
                  OCR, карточки документов, базы, поиск и загрузка во внешние
                  системы.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-paper">
        <div className="shell">
          <div className="section-title-row">
            <SectionHeading
              eyebrow="Опыт работ"
              title="Здесь цифры уже означают сделанную работу"
              text="Исторические издания, административные архивы и цифровые системы — отдельные страницы каждого проекта."
            />
            <Link className="text-link" href="/experience">
              Все проекты →
            </Link>
          </div>
          <div className="case-grid">
            {featured.map((item) => (
              <CaseCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section home-price-preview">
        <div className="shell home-price-preview-grid">
          <div>
            <p className="eyebrow">Стоимость</p>
            <h2>Цена зависит от материала — но ориентиры мы не прячем</h2>
            <p>
              Современная россыпь A4 начинается от 2 ₽ за лист, редкие книги —
              от 20 ₽, газеты — от 50 ₽.
            </p>
            <Link className="button" href="/prices">
              Смотреть все цены
            </Link>
          </div>
          <div className="home-price-stack">
            <article>
              <span>Документы A4</span>
              <strong>от 2 ₽</strong>
            </article>
            <article>
              <span>Книги</span>
              <strong>от 20 ₽</strong>
            </article>
            <article>
              <span>Газеты</span>
              <strong>от 50 ₽</strong>
            </article>
          </div>
        </div>
      </section>

      <ContactBand
        title="Покажите материал — предложим технологию"
        text="Достаточно 5–10 характерных страниц, примерного объёма и понимания, какой результат нужен на выходе."
      />
    </PageShell>
  );
}
