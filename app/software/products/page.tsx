import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  ContactBand,
  PageShell,
  SectionHeading,
} from "../../components";
import { DirectionNav } from "../../DirectionNav";
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
            text="Готовность инструмента и возможность коммерческой поставки — разные вещи. Форму адаптации определяем после знакомства с вашей задачей."
          />
          {engineering.map((product, index) => (
            <EngineeringEntry
              key={product.slug}
              product={product}
              index={index}
            />
          ))}
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
                <p className="eyebrow">{product.label}</p>
                <h2>{product.title}</h2>
                <p className="application-status">{product.status}</p>
                <p>{product.problem}</p>
                <ul>
                  {product.functions.map((fn) => (
                    <li key={fn}>{fn}</li>
                  ))}
                </ul>
                <p className="engineering-cooperation">{product.cooperation}</p>
                <Link
                  className="text-link"
                  href={`/software/products/${product.slug}`}
                >
                  О продукте и текущих границах →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell company-experience-grid">
          <SectionHeading
            eyebrow="Другие примеры разработки"
            title="Дополнительные задачи — тот же инженерный подход"
            text="В рабочем арсенале также есть инструменты обработки видео, локальной транскрибации аудио и интерактивная образовательная веб-картотека. Они дополняют компетенции, сохраняя фокус основного портфолио."
          />
          <div className="company-experience-note">
            <p>
              Публичных загрузок, магазина и готовых лицензий здесь пока нет.
              Возможность демонстрации и адаптации обсуждаем отдельно.
            </p>
            <Link className="text-link" href="/contact">
              Обсудить похожую задачу →
            </Link>
          </div>
        </div>
      </section>
      <ContactBand
        title="Какой процесс нужно изменить у вас?"
        text="Обсудим исходный массив, правила и критерии приёмки. Предложим адаптацию имеющейся технологии или отдельную разработку по заданию."
      />
    </PageShell>
  );
}
