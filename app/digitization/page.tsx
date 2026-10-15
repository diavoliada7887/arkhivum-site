import type { Metadata } from "next";
import { DirectionNav } from "../DirectionNav";
import { sitePath } from "../site-path";
import Link from "next/link";
import styles from "./digitization.module.css";
import { digitizationTasks } from "./tasks";
import {
  CaseCard,
  ContactBand,
  PageShell,
  SectionHeading,
} from "../components";
import { cases, digitizationServices } from "../content";

export const metadata: Metadata = {
  title: "Оцифровка и архивные технологии",
  description:
    "Оцифровка книг, документов, периодики и архивных фондов. Оборудование, проекты, цены и полный цикл подготовки электронных коллекций.",
};

const serviceGroups = [
  {
    id: "business",
    kicker: "Для компаний и организаций",
    title: "Оцифровка документов и загрузка в информационные системы",
    description:
      "Сканируем документы — от тысячи медицинских карт до архива предприятия. Распознаём текст, индексируем файлы и готовим данные для поиска или загрузки в вашу систему. При необходимости упорядочиваем бумажные оригиналы.",
    slugs: ["mass-digitization", "archive-ordering", "binding"],
  },
  {
    id: "books",
    kicker: "Для частных заказчиков и исследователей",
    title: "Оцифровка книг, газет и журналов",
    description:
      "Сканируем книги, учебники, научные издания, газеты и журналы. Подберём формат файла, при необходимости сделаем PDF и распознавание текста.",
    slugs: ["books", "newspapers", "periodicals-20-century"],
  },
  {
    id: "collections",
    kicker: "Для библиотек, музеев и архивов",
    title: "Исторические фонды и сложные издания",
    description:
      "Оцифровка редких книг, газет, периодики и архивных дел с сохранением особенностей оригинала и структуры коллекции.",
    slugs: ["books", "newspapers", "periodicals-20-century", "archival-files"],
  },
  {
    id: "formats",
    kicker: "Для инженерной документации",
    title: "Большие листы и нестандартные оригиналы",
    description:
      "Работаем с техническими чертежами, схемами и крупными картами. Подбираем безопасную технологию по материалу.",
    slugs: ["maps-drawings"],
  },
] as const;

export default function DigitizationPage() {
  const featured = ["kronstadt", "rare-books", "shalya", "saratov"]
    .map((slug) => cases.find((item) => item.slug === slug))
    .filter((item): item is (typeof cases)[number] => Boolean(item));

  return (
    <PageShell>
      <DirectionNav current="digitization" />
      <section className={styles.servicesOpening} aria-labelledby="digitization-heading">
        <div className="shell">
          <h1 className={styles.visuallyHidden} id="digitization-heading">
            Оцифровка и архивные технологии
          </h1>
          <nav className={styles.categoryGrid} aria-label="Выберите свою задачу">
            {digitizationTasks.map((entry) => (
              <a className={styles.categoryCard} href={`#${entry.id}`} key={entry.id}>
                <img
                  className={styles.categoryImage}
                  src={sitePath(entry.image)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.categoryContent}>
                  <span className={styles.categoryKicker}>{entry.kicker}</span>
                  <strong className={styles.categoryTitle}>{entry.title}</strong>
                  <span className={styles.categoryDescription}>{entry.description}</span>
                  <span className={styles.categoryAction}>
                    Выбрать услуги <span aria-hidden="true">↗</span>
                  </span>
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className={styles.serviceDirectory}>
        {serviceGroups.map((group) => (
          <section className={styles.serviceGroup} id={group.id} key={group.id} aria-label={group.title}>
            <div className="shell">
              <div className={styles.groupIntroduction}>
                <p className={styles.groupKicker}>{group.kicker}</p>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <div className={styles.groupServiceGrid}>
                {group.slugs.map((slug) => {
                  const service = digitizationServices.find((item) => item.slug === slug);
                  if (!service) return null;
                  return (
                    <Link
                      href={`/services/${service.slug}`}
                      className={styles.groupServiceCard}
                      key={slug}
                    >
                      <strong>{service.title}</strong>
                      <span>{service.short}</span>
                      <span className={styles.groupServiceAction}>
                        Подробнее <span aria-hidden="true">↗</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
        <div className={styles.otherTask}>
          <span>Не нашли свою задачу?</span>
          <Link href="/contact">Расскажите, что нужно оцифровать ↗</Link>
        </div>
      </div>

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

      <section className="section section-paper">
        <div className="shell company-experience-grid">
          <SectionHeading
            eyebrow="Следующий этап"
            title="После цифровых копий — данные и системы"
            text="Оцифровку можно продолжить описанием документов, наполнением базы и подготовкой обмена с информационной системой. Эти задачи ведёт наше программное направление."
          />
          <div className="company-experience-note">
            <Link className="text-link" href="/software/databases-integrations">
              Базы данных и интеграции →
            </Link>
            <br />
            <Link className="text-link" href="/software/server-solutions">
              Хранение и серверная обработка →
            </Link>
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
