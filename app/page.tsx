import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "./components";
import { sitePath } from "./site-path";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: { absolute: "Архивум — оцифровка, разработка ПО и автоматизация" },
  description:
    "Сохраняем ценное. Создаём новое. Оцифровка и архивные технологии, разработка программного обеспечения, обработка данных и автоматизация процессов.",
};

const navItems = [
  { href: "/digitization", label: "Оцифровка" },
  { href: "/software", label: "Разработка ПО" },
  { href: "/equipment", label: "Оборудование" },
  { href: "/experience", label: "Проекты" },
  { href: "/about", label: "О компании" },
  { href: "/prices", label: "Цены" },
  { href: "/contact", label: "Контакты" },
];

export default function Home() {
  return (
    <>
      <div className={styles.home}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.brand} aria-label="Архивум — главная">
              <strong>АРХИВУМ</strong>
              <span>ИНФОРМАЦИЯ И ТЕХНОЛОГИИ</span>
            </Link>
            <nav className={styles.desktopNav} aria-label="Основная навигация">
              {navItems.map(({ href, label }) => (
                <Link href={href} key={href}>{label}</Link>
              ))}
            </nav>
            <Link className={styles.headerContact} href="/contact">
              Обсудить проект <span aria-hidden="true">→</span>
            </Link>
            <details className={styles.mobileNav}>
              <summary>Меню <span aria-hidden="true">☰</span></summary>
              <nav aria-label="Мобильная навигация">
                {navItems.map(({ href, label }) => (
                  <Link href={href} key={href}>{label}</Link>
                ))}
                <Link href="/contact">Обсудить проект →</Link>
              </nav>
            </details>
          </div>
        </header>

        <main>
          <section className={styles.hero}>
            <div className={styles.heroImage} aria-hidden="true">
              <img
                src={sitePath("/assets/hero-planetary-scanner.webp")}
                alt=""
                fetchPriority="high"
              />
            </div>
            <div className={styles.heroShade} aria-hidden="true" />
            <div className={styles.heroInner}>
              <div className={styles.heroContent}>
                <p className={styles.kicker}>АРХИВУМ · ИНФОРМАЦИЯ И ТЕХНОЛОГИИ</p>
                <h1>Сохраняем ценное.<br /><em>Создаём новое.</em></h1>
                <p className={styles.heroDescription}>
                  Оцифровка и архивные технологии. Разработка программного
                  обеспечения, обработка данных и автоматизация процессов.
                </p>
                <div className={styles.actions}>
                  <Link className={styles.primaryButton} href="/services">Наши услуги <span aria-hidden="true">→</span></Link>
                  <Link className={styles.outlineButton} href="/software/products">Наши разработки</Link>
                </div>
              </div>
              <div className={styles.proofBar} aria-label="Наши направления и компетенции">
                <div><span className={styles.proofIcon} aria-hidden="true">▤</span><span>Опыт<br />в оцифровке</span></div>
                <div><span className={styles.proofIcon} aria-hidden="true">〈/〉</span><span>Собственные<br />разработки</span></div>
                <div><span className={styles.proofIcon} aria-hidden="true">▥</span><span>Работа с большими<br />объёмами данных</span></div>
                <div><span className={styles.proofIcon} aria-hidden="true">⚙</span><span>Комплексные<br />решения</span></div>
              </div>
            </div>
          </section>

          <section className={styles.directions} aria-label="Направления работы">
            <article className={[styles.direction, styles.archiveDirection].join(" ")}>
              <div className={styles.cardPicture} aria-hidden="true">
                <img src={sitePath("/assets/rare-book-open.webp")} alt="" loading="lazy" />
              </div>
              <div className={styles.cardShade} aria-hidden="true" />
              <div className={styles.cardContent}>
                <p className={styles.cardKicker}>01 / ОЦИФРОВКА И АРХИВНЫЕ УСЛУГИ</p>
                <h2>Сохраняем<br />информацию<br />для будущего</h2>
                <p>
                  Оцифровка документов, книг, газет, журналов, карт и архивных
                  фондов. Упорядочивание, переплёт и работа с большими массивами.
                </p>
                <Link href="/services" className={styles.primaryButton}>Перейти к услугам <span aria-hidden="true">→</span></Link>
              </div>
            </article>

            <article className={[styles.direction, styles.softwareDirection].join(" ")}>
              <div className={styles.cardPicture} aria-hidden="true">
                <img
                  src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&amp;fit=crop&amp;w=1400&amp;q=85"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className={styles.cardShade} aria-hidden="true" />
              <div className={styles.cardContent}>
                <p className={styles.cardKicker}>02 / РАЗРАБОТКА ПО И АВТОМАТИЗАЦИЯ</p>
                <h2>Инженерные<br />решения<br />для реальных задач</h2>
                <p>
                  Разрабатываем прикладные программы, инструменты обработки
                  данных и системы автоматизации. От специализированных утилит
                  до комплексных программных решений.
                </p>
                <Link href="/software" className={styles.outlineButton}>Наши разработки <span aria-hidden="true">→</span></Link>
              </div>
            </article>
          </section>

          <section className={styles.contact} aria-labelledby="home-contact-title">
            <h2 id="home-contact-title">Давайте обсудим ваш проект</h2>
            <p>Подберём оптимальное решение и ответим на ваши вопросы.</p>
            <div className={styles.contactActions}>
              <Link className={styles.primaryButton} href="/contact">Связаться с нами <span aria-hidden="true">→</span></Link>
              <Link className={styles.contactOutline} href="/contact">Контакты</Link>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
