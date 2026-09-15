import Link from "next/link";
import { StaticRedirect } from "../../StaticRedirect";
import { sitePath } from "../../site-path";
import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  ContactBand,
  PageShell,
  RelatedCases,
} from "../../components";
import { serviceBySlug, services } from "../../content";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...services.map((service) => ({ slug: service.slug })), { slug: "organization-binding" }];
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "organization-binding") {
    return <StaticRedirect to="/services/archive-ordering" />;
  }
  const service = serviceBySlug[slug];
  if (!service) notFound();
  const hasEditorialHero =
    service.slug === "books" ||
    service.slug === "newspapers" ||
    service.slug === "periodicals-20-century" ||
    service.slug === "mass-digitization" ||
    service.slug === "maps-drawings" ||
    service.slug === "archive-ordering";

  return (
    <PageShell>
      <section
        className={`detail-hero ${
          hasEditorialHero
            ? `detail-hero-books detail-hero-${service.slug} page-hero-dark`
            : ""
        }`}
      >
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Услуги", href: "/services" },
              { label: service.title },
            ]}
          />
          <div className="detail-hero-grid">
            <div>
              <p
                className={`eyebrow ${
                  hasEditorialHero ? "eyebrow-light" : ""
                }`}
              >
                {service.eyebrow}
              </p>
              {service.slug === "books" ? (
                <h1 className="split-heading">
                  <span>Книги и редкие</span>
                  <br />
                  <em>издания</em>
                </h1>
              ) : service.slug === "newspapers" ? (
                <h1 className="split-heading">
                  <span>Газеты</span>
                  <br />
                  <em>подшивки и россыпь</em>
                </h1>
              ) : service.slug === "periodicals-20-century" ? (
                <h1 className="split-heading">
                  <span>Периодические издания</span>
                  <br />
                  <em>XX века</em>
                </h1>
              ) : service.slug === "mass-digitization" ? (
                <h1 className="split-heading">
                  <span>Оцифровка больших</span>
                  <br />
                  <em>массивов</em>
                </h1>
              ) : service.slug === "maps-drawings" ? (
                <h1 className="split-heading">
                  <span>Карты</span>
                  <br />
                  <em>и чертежи</em>
                </h1>
              ) : service.slug === "archive-ordering" ? (
                <h1 className="split-heading">
                  <span>Упорядочивание</span>
                  <br />
                  <em>архивных дел</em>
                </h1>
              ) : (
                <h1>{service.title}</h1>
              )}
              <p className="detail-lead">{service.lead}</p>
            </div>
            {service.image ? (
              <figure
                className={`detail-hero-image ${
                  service.imageMode === "contain"
                    ? "detail-hero-image-contain"
                    : ""
                }`}
              >
                <img src={sitePath(service.image)} alt={service.imageAlt ?? ""} />
                {service.heroCaption ? (
                  <figcaption>{service.heroCaption}</figcaption>
                ) : null}
              </figure>
            ) : (
              <div className="detail-hero-image detail-hero-placeholder">
                <span>{service.visualLabel ?? service.title}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="service-price-strip">
        <div className="shell service-price-strip-inner">
          <span>Ориентир по стоимости</span>
          <strong>{service.price}</strong>
          <Link href="/prices">Все цены и условия →</Link>
        </div>
      </section>

      {service.showcase ? (
        <section className="section section-paper service-showcase">
          <div className="shell service-showcase-grid">
            <figure>
              <img src={sitePath(service.showcase.image)} alt={service.showcase.alt} />
              <figcaption>{service.showcase.caption}</figcaption>
            </figure>
            <div>
              <p className="eyebrow">{service.showcase.eyebrow}</p>
              <h2>{service.showcase.title}</h2>
              <p>{service.showcase.text}</p>
            </div>
          </div>
        </section>
      ) : null}

      {service.slug === "mass-digitization" ? (
        <>
          <section className="section section-paper mass-rules">
            <div className="shell service-content-shell">
              <div className="mass-rules-heading">
                <div>
                  <p className="eyebrow">Сроки хранения</p>
                  <h2>Бумага может быть нужна десятилетиями</h2>
                </div>
                <p>
                  Срок зависит от вида документа и отсчитывается по правилам
                  архивного законодательства. Освободить помещение можно не
                  уничтожением оригиналов, а переносом ежедневного доступа в
                  цифровую систему.
                </p>
              </div>
              <div className="mass-rules-grid">
                <article>
                  <strong>5+ лет</strong>
                  <h3>Налоговые и бухгалтерские документы</h3>
                  <p>Первичка и регистры хранятся не менее пяти лет после отчётного года.</p>
                  <a
                    className="mass-rule-link"
                    href="https://www.consultant.ru/document/cons_doc_LAW_122855/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ФЗ № 402-ФЗ, ст. 29 ↗
                  </a>
                </article>
                <article>
                  <strong>по виду договора</strong>
                  <h3>Договоры и приложения</h3>
                  <p>Срок зависит от предмета; для многих документов отсчёт продолжается после исполнения обязательств.</p>
                  <a
                    className="mass-rule-link"
                    href="https://www.consultant.ru/document/cons_doc_LAW_345020/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Приказ Росархива № 236 ↗
                  </a>
                </article>
                <article>
                  <strong>25 лет</strong>
                  <h3>Медицинские карты</h3>
                  <p>Карты стационарных и амбулаторных пациентов относятся к документам длительного хранения.</p>
                  <a
                    className="mass-rule-link"
                    href="https://www.consultant.ru/document/cons_doc_LAW_121777/59797ed054f359ba63f8b8b0aa1da9f15183b7a9/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Перечень меддокументации ↗
                  </a>
                </article>
                <article>
                  <strong>50/75 лет</strong>
                  <h3>Кадровые документы</h3>
                  <p>Трудовые договоры, личные дела и сведения о стаже могут храниться десятилетиями.</p>
                  <a
                    className="mass-rule-link"
                    href="https://www.consultant.ru/document/cons_doc_LAW_345020/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Приказ Росархива № 236 ↗
                  </a>
                </article>
              </div>
              <p className="mass-rules-note">
                Точный срок устанавливается по номенклатуре дел и действующим
                перечням для конкретного вида документа.
              </p>
            </div>
          </section>

          <section className="section mass-sectors">
            <div className="shell service-content-shell">
              <div className="mass-sectors-layout">
                <div className="mass-sectors-copy">
                  <p className="eyebrow eyebrow-light">Где особенно больно</p>
                  <h2>Массивы, в которых цена долгого поиска слишком высока</h2>
                  <div className="mass-sectors-grid">
                    <article><span>01</span><h3>Суды и юридические службы</h3><p>Дела, приложения, доказательства, доверенности и договоры с оригинальными подписями.</p></article>
                    <article><span>02</span><h3>Больницы и медицинские центры</h3><p>Карты пациентов, истории болезни, результаты исследований и информированные согласия.</p></article>
                    <article><span>03</span><h3>Страховые компании</h3><p>Полисы, заявления, акты, экспертные заключения и документы по страховым случаям.</p></article>
                    <article><span>04</span><h3>Логистика и транспорт</h3><p>Накладные, путевые листы, акты, реестры рейсов и подтверждающие документы.</p></article>
                  </div>
                </div>
                <figure className="mass-sectors-photo">
                  <img
                    src={sitePath("/assets/mass-paper-backlog-real.webp")}
                    alt="Документы и папки, сложенные в переполненные коробки"
                  />
                  <figcaption>
                    Архив до систематизации и оцифровки
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>

          <section className="mass-contradiction">
            <div className="shell mass-contradiction-inner">
              <div className="mass-contradiction-title">
                <span className="mass-contradiction-icon" aria-hidden="true">
                  ⇄
                </span>
                <p>Главное противоречие</p>
              </div>
              <div className="mass-contradiction-copy">
                <h2>Срок хранения — годы. Срок доступа — секунды.</h2>
                <p>
                  Оригиналы остаются в архиве в соответствии с установленными
                  требованиями, а для ежедневной работы создаётся
                  систематизированный цифровой массив с быстрым поиском каждого
                  документа.
                </p>
              </div>
              <figure className="mass-contradiction-photo">
                <img
                  src={sitePath("/assets/mass-canon-scanner.png")}
                  alt="Промышленный сканер Canon с загруженной пачкой документов"
                />
              </figure>
            </div>
          </section>
        </>
      ) : null}

      {service.slug === "periodicals-20-century" ? (
        <>
          <section className="section section-paper periodical-colour">
            <div className="shell service-content-shell periodical-colour-grid">
              <figure>
                <img
                  src={sitePath("/assets/periodicals-1938-spread.jpeg")}
                  alt="Цветная иллюстрация из журнала «Народное творчество» 1938 года"
                />
                <figcaption>
                  Журнал «Народное творчество», 1938 год · цветная вкладка
                </figcaption>
              </figure>
              <div>
                <p className="eyebrow">Качество, которое видно</p>
                <h2>Цвет остаётся частью документа</h2>
                <p>
                  Пожелтевшая бумага, полиграфические краски, мелкие подписи,
                  орнаменты и тоновые переходы передаются без грубого
                  осветления и потери деталей. Цифровая копия сохраняет не
                  только содержание издания, но и особенности оригинальной
                  печати.
                </p>
                <div className="periodical-quality-note">
                  <strong>1938</strong>
                  <span>год издания на представленном скане</span>
                </div>
              </div>
            </div>
          </section>

          <section
            className="section periodical-navigation"
            id="interactive-pdf"
          >
            <div className="shell service-content-shell">
              <div className="periodical-navigation-heading">
                <div>
                  <p className="eyebrow eyebrow-light">Не просто PDF</p>
                  <h2>Нужная статья открывается одним нажатием</h2>
                </div>
                <p>
                  Переносим структуру издания внутрь файла: разделы, рубрики,
                  названия материалов и авторы становятся интерактивными
                  закладками. Читателю не нужно последовательно перелистывать
                  сотни страниц.
                </p>
              </div>
              <div className="periodical-navigation-gallery">
                <figure>
                  <img
                    src={sitePath("/assets/pdf-navigation-hierarchical.png")}
                    alt="Многоуровневые закладки PDF с разделами и авторами"
                  />
                  <figcaption>
                    Многоуровневая структура: раздел → материал → автор
                  </figcaption>
                </figure>
                <figure>
                  <img
                    src={sitePath("/assets/pdf-navigation-contents.png")}
                    alt="Интерактивное содержание журнала в PDF"
                  />
                  <figcaption>
                    Каждый пункт содержания связан с фактической страницей
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>

          <section className="periodical-software">
            <div className="shell service-content-shell periodical-software-grid">
              <div className="periodical-code-mark" aria-hidden="true">
                &lt;/&gt;
              </div>
              <div>
                <p className="eyebrow">Собственное программное решение</p>
                <h2>Структуру больших документов формируем нашим инструментом</h2>
              </div>
              <p>
                Мы разработали скрипт, который расставляет названия и уровни
                навигации внутри PDF по подготовленному содержанию. Специалист
                проверяет названия, иерархию и соответствие переходов
                фактическим страницам — автоматизация ускоряет работу, но не
                подменяет контроль.
              </p>
            </div>
          </section>

          <section className="section section-paper periodical-standalone">
            <div className="shell service-content-shell">
              <div className="periodical-standalone-heading">
                <p className="eyebrow">Отдельная услуга</p>
                <h2>Интерактивное содержание — для любого готового PDF</h2>
                <p>
                  Повторное сканирование не требуется. Мы можем обработать
                  существующую книгу, журнал, сборник статей, каталог, отчёт,
                  диссертацию, техническую документацию или архивную подшивку.
                </p>
              </div>
              <div className="periodical-flow" aria-label="Этапы создания интерактивного содержания">
                <article><span>01</span><strong>Готовый PDF</strong></article>
                <b aria-hidden="true">→</b>
                <article><span>02</span><strong>Разбор структуры</strong></article>
                <b aria-hidden="true">→</b>
                <article><span>03</span><strong>Интерактивное содержание</strong></article>
                <b aria-hidden="true">→</b>
                <article><span>04</span><strong>Быстрые переходы</strong></article>
              </div>
              <p className="periodical-standalone-note">
                Оцифровка и формирование интерактивного содержания —
                самостоятельные услуги. Их можно заказать отдельно или
                объединить в один проект.
              </p>
            </div>
          </section>
        </>
      ) : null}

      {service.slug === "archive-ordering" ? (
        <>
          <section className="section section-paper ordering-purpose">
            <div className="shell service-content-shell ordering-purpose-grid">
              <div>
                <p className="eyebrow">Архив как система</p>
                <h2>От массива документов — к сформированным и учтённым делам</h2>
              </div>
              <div className="ordering-purpose-copy">
                <p>
                  Упорядочивание требуется, когда документы накоплены россыпью,
                  папки сформированы стихийно, описи устарели или архив нужно
                  подготовить к передаче на постоянное либо долговременное
                  хранение.
                </p>
                <p>
                  Мы систематизируем документы на уровне всего фонда и каждого
                  отдельного дела. Базовая подшивка сформированных дел в
                  стандартные архивные папки входит в стоимость
                  упорядочивания. Другие варианты переплёта и оформления
                  согласовываем отдельно — с учётом срока хранения, формата и
                  состояния документов.
                </p>
              </div>
            </div>
          </section>

          <section className="ordering-numbering">
            <div className="shell service-content-shell ordering-numbering-grid">
              <figure>
                <img
                  src={sitePath("/assets/archive-ordering-numbering.jpg")}
                  alt="Ручной нумератор на рабочем участке упорядочивания архивных дел"
                />
                <figcaption>
                  Нумерация листов ручным нумератором на нашем рабочем участке
                </figcaption>
              </figure>
              <div>
                <p className="eyebrow eyebrow-light">Нормативное оформление</p>
                <h2>Нумерация листов по архивным правилам</h2>
                <p>
                  Листы дела нумеруют валовым порядком арабскими цифрами.
                  Методические рекомендации Росархива прямо предусматривают
                  графитный карандаш или нумератор: номер ставится в правом
                  верхнем углу, не затрагивая текст документа.
                </p>
                <p>
                  После нумерации составляем лист-заверитель. В нём указываем
                  общее количество листов и отдельно фиксируем литерные,
                  пропущенные номера, вложения, конверты и другие особенности
                  конкретного дела.
                </p>
                <a
                  className="ordering-rule-link"
                  href="https://archives.gov.ru/sites/default/files/2014-metod-rekomendacii-konkursny-upravl.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Методические рекомендации Росархива ↗
                </a>
              </div>
            </div>
          </section>

          <section className="section section-paper ordering-documents">
            <div className="shell service-content-shell">
              <div className="ordering-documents-heading">
                <p className="eyebrow">Справочный аппарат</p>
                <h2>Состав справочного аппарата архива</h2>
                <p>
                  Состав комплекта зависит от вида фонда, сроков хранения и
                  требований организации или принимающего архива.
                </p>
              </div>
              <div className="ordering-documents-grid">
                <article>
                  <span>01</span>
                  <h3>Архивная опись</h3>
                  <p>Перечень единиц хранения с индексами, заголовками, крайними датами, количеством листов и примечаниями.</p>
                </article>
                <article>
                  <span>02</span>
                  <h3>Внутренняя опись</h3>
                  <p>Составляется внутри сложного или особо ценного дела и раскрывает его документный состав.</p>
                </article>
                <article>
                  <span>03</span>
                  <h3>Лист-заверитель</h3>
                  <p>Подтверждает объём дела и фиксирует все особенности нумерации и физического состава.</p>
                </article>
                <article>
                  <span>04</span>
                  <h3>Историческая справка</h3>
                  <p>Описывает историю фондообразователя, его функции и структуру, состав документов и изменения фонда.</p>
                </article>
              </div>
            </div>
          </section>
        </>
      ) : null}

      <section
        className={`section service-result service-result-${service.slug}`}
      >
        <div className="shell service-content-shell">
          <div className="service-result-main">
            <div className="service-result-heading">
              <p className="eyebrow eyebrow-light">Результат</p>
              <h2>Что получает заказчик</h2>
              <p>
                {service.resultIntro ??
                  "Структурированный комплект файлов, подготовленный для хранения, работы и загрузки в систему заказчика."}
              </p>
            </div>
            <ul className="service-deliverables">
              {service.deliverables.map((item, index) => {
                const detail = service.deliverableDetails?.[index];
                return (
                  <li key={item}>
                    <span className="deliverable-mark">
                      {detail?.mark ?? String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <strong>{detail?.title ?? item}</strong>
                      {detail ? <p>{detail.text}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          {service.slug === "newspapers" ? (
            <figure className="service-result-photo">
              <img
                src={sitePath("/assets/newspapers-planetary-scanner.webp")}
                alt="Оцифровка газетного выпуска на планетарном сканере"
              />
              <figcaption>
                Оцифровка газетного фонда на планетарном сканере
              </figcaption>
            </figure>
          ) : null}
        </div>
      </section>

      {service.slug === "mass-digitization" ? (
        <section className="mass-service-modules">
          <div className="shell service-content-shell">
            <div className="mass-service-modules-heading">
              <p className="eyebrow">Состав проекта</p>
              <h2>Отдельные услуги. Единый результат — когда он нужен.</h2>
            </div>
            <div className="mass-service-modules-grid">
              <article>
                <span>01</span>
                <h3>Оцифровка</h3>
                <p>
                  Создаём цифровые копии документов, контролируем качество и
                  сохраняем привязку к бумажным оригиналам.
                </p>
                <b>Результат: комплект файлов</b>
              </article>
              <article>
                <span>02</span>
                <h3>Атрибуция</h3>
                <p>
                  Описываем документы по согласованным полям: вид, дата, номер,
                  стороны и другие поисковые признаки.
                </p>
                <b>Результат: структурированные данные</b>
              </article>
              <article>
                <span>03</span>
                <h3>Формирование базы данных</h3>
                <p>
                  Связываем файлы и карточки, настраиваем поиск и готовим массив
                  для работы или загрузки в систему заказчика.
                </p>
                <b>Результат: готовая поисковая система</b>
              </article>
            </div>
            <p className="mass-service-modules-note">
              Каждый модуль можно заказать отдельно или объединить услуги в
              полный цикл — состав проекта определяется задачей заказчика.
            </p>
          </div>
        </section>
      ) : null}

      <section
        className={`section section-paper service-process service-process-${service.slug}`}
      >
        <div className="shell service-content-shell">
          <div className="service-process-heading">
            <p className="eyebrow">Процесс</p>
            <h2 className="compact-title">
              {service.slug === "archive-ordering"
                ? "Как проходит упорядочивание"
                : "Три понятных этапа"}
            </h2>
          </div>
          <div className="process-grid">
            {service.process.map((step, index) => (
              <article key={step.title}>
                <div className="process-card-head">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {step.label ? <b>{step.label}</b> : null}
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <RelatedCases slugs={service.relatedCases} />
      <ContactBand
        title="Нужно оценить ваш материал?"
        text="Пришлите несколько характерных страниц и опишите объём. Мы предложим технологию, состав результата и порядок работ."
      />
    </PageShell>
  );
}
