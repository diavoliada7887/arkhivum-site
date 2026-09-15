import Link from "next/link";
import { ContactBand, PageShell } from "../components";

const documentPrices = [
  {
    period: "2015 — настоящее время",
    price: "2–10 ₽",
    note: "лист A4 · россыпь и офисные документы",
  },
  {
    period: "1995–2015",
    price: "7–15 ₽",
    note: "лист A4 · цена зависит от состояния и объёма",
  },
  {
    period: "1970–1995",
    price: "15–20 ₽",
    note: "лист A4 · возможна ручная подача",
  },
  {
    period: "Ранее 1970 года",
    price: "от 30 ₽",
    note: "лист · технология определяется после осмотра",
  },
];

const otherPrices = [
  {
    title: "Книги в хорошем состоянии",
    price: "от 20 ₽ / лист",
    note: "Стандартное раскрытие и стабильный формат.",
  },
  {
    title: "Ветхие и редкие книги",
    price: "по запросу",
    note: "Учитываем переплёт, раскрытие, формат и необходимость колыбели.",
  },
  {
    title: "Газеты",
    price: "от 50 ₽ / лист",
    note: "Подшивки, отдельные номера и россыпь; цена зависит от формата, состояния и необходимости OCR.",
  },
  {
    title: "Карты и чертежи",
    price: "по формату",
    note: "Планшетная или рулонная съёмка, размеры до A0 и более.",
  },
  {
    title: "Упорядочивание документов",
    price: "≈ 2 000 ₽ / дело",
    note: "Ориентир для дела до 250 листов; итог зависит от состава массива.",
  },
  {
    title: "Переплёт",
    price: "после осмотра",
    note: "Стоимость зависит от толщины, формата и подготовки документов.",
  },
  {
    title: "Базы данных и интеграция",
    price: "по составу карточки",
    note: "Количество полей, справочников, связей и требования внешней системы.",
  },
  {
    title: "Программные решения",
    price: "по техническому заданию",
    note: "После прототипа на реальных материалах заказчика.",
  },
];

export default function PricesPage() {
  return (
    <PageShell>
      <section className="page-hero page-hero-dark">
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow">Цены</p>
            <h1>Понятные ориентиры до оценки проекта</h1>
          </div>
          <p>
            Здесь не декоративное «от 1 рубля». Диапазоны привязаны к возрасту,
            состоянию и способу подачи материала.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Документы A4</p>
            <h2>Стоимость оцифровки одного листа</h2>
          </div>
          <div className="price-table" role="table" aria-label="Цены на документы">
            {documentPrices.map((row) => (
              <div className="price-row" role="row" key={row.period}>
                <strong role="cell">{row.period}</strong>
                <span role="cell">{row.note}</span>
                <b role="cell">{row.price}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-paper">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Другие работы</p>
            <h2>Книги, газеты, архивы и данные</h2>
          </div>
          <div className="price-card-grid">
            {otherPrices.map((item) => (
              <article className="price-card" key={item.title}>
                <h3>{item.title}</h3>
                <strong>{item.price}</strong>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section price-notes">
        <div className="shell two-column-copy">
          <div>
            <p className="eyebrow">Что меняет цену</p>
            <h2>Точный расчёт — после пробы на вашем материале</h2>
          </div>
          <div>
            <ul className="check-list">
              <li>Объём партии и однородность документов</li>
              <li>Формат, возраст, ветхость, сшивка и скрепления</li>
              <li>Разрешение, цветность и требуемые форматы файлов</li>
              <li>OCR, водяные знаки, метаданные и ручная атрибуция</li>
              <li>Работа на территории заказчика и сроки проекта</li>
            </ul>
            <Link className="button" href="/contact">
              Получить расчёт
            </Link>
          </div>
        </div>
      </section>

      <ContactBand
        title="Пришлите 5–10 характерных страниц"
        text="По ним мы определим способ подачи, реальную производительность и стоимость без гадания по телефону."
      />
    </PageShell>
  );
}
