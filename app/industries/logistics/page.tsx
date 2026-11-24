import type { Metadata } from "next";
import Link from "next/link";
import { ContactBand, PageShell } from "../../components";
import { sitePath } from "../../site-path";
import styles from "./logistics.module.css";

export const metadata: Metadata = {
  title: "Архивная обработка для транспортных компаний",
  description:
    "Разбор, оцифровка и индексация архивов перевозчиков и экспедиторов. Накладные, договоры, путевые листы и первичные документы.",
};

const problems = [
  ["Налоговая запросила первичные документы", "Накладную, УПД или счёт-фактуру приходится искать среди бумажных папок."],
  ["Возник спор с клиентом", "Нужно быстро подтвердить условия перевозки, маршрут и факт оказания услуги."],
  ["Архив продолжает расти", "Документы занимают шкафы и помещения, хотя часть уже не требуется хранить."],
  ["Сотрудники разбирают бумагу", "Время бухгалтерии и логистов уходит на поиск, сортировку и ручные реестры."],
] as const;

const steps = [
  "Согласуем состав и объём работ",
  "Примем документы по описи",
  "Организуем конфиденциальный доступ",
  "Разберём, оцифруем и проиндексируем",
  "Подготовим базу и архивные документы",
  "Передадим результат и вернём оригиналы",
];

export default function LogisticsPage() {
  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroImage} aria-hidden="true">
          <img src={sitePath("/assets/mass-saratov-contracts.webp")} alt="" />
        </div>
        <div className="shell">
          <p className={styles.kicker}>Для перевозчиков и экспедиторов</p>
          <h1>Упорядочим и оцифруем архив транспортной компании</h1>
          <p className={styles.lead}>
            Накладные, договоры, путевые листы, УПД и первичные документы
            превращаем в управляемый цифровой массив с понятным поиском.
          </p>
          <div className={styles.actions}>
            <Link className="button button-light" href="/contact">Рассчитать проект</Link>
            <Link href="/prices#archive-processing">Посмотреть тарифы →</Link>
          </div>
        </div>
      </section>

      <section className={styles.lawNote}>
        <div className="shell">
          <strong>Электронные перевозочные документы уже обязательны</strong>
          <p>
            С 1 сентября 2026 года электронный формат действует для транспортных
            накладных, заказов и заявок, а также ряда экспедиторских документов.
            Архив прошлых лет остаётся отдельной задачей — его можно привести в
            порядок и связать с новой цифровой средой.
          </p>
        </div>
      </section>

      <section className={styles.problemSection}>
        <div className="shell">
          <p className={styles.kicker}>Когда бумажный архив тормозит работу</p>
          <h2>Документы нужны сейчас, а поиск занимает часы</h2>
          <div className={styles.problemGrid}>
            {problems.map(([title, text], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.resultSection}>
        <div className="shell">
          <div className={styles.resultIntro}>
            <p className={styles.kicker}>Результат</p>
            <h2>Единая структура вместо шкафов и разрозненных таблиц</h2>
          </div>
          <div className={styles.resultGrid}>
            <article><strong>Быстрый поиск</strong><p>По номеру, дате, контрагенту, маршруту и виду документа.</p></article>
            <article><strong>Свободные сотрудники</strong><p>Ручной разбор и индексацию берёт на себя наша команда.</p></article>
            <article><strong>Меньше бумаги</strong><p>Определяем документы с истёкшими сроками хранения и оформляем отбор.</p></article>
            <article><strong>Цифровая копия</strong><p>Сохраняем содержание документов на случай повреждения оригинала.</p></article>
          </div>
        </div>
      </section>

      <section className={styles.performance}>
        <div className="shell">
          <div>
            <p className={styles.kicker}>Производительность</p>
            <h2>Одного выделенного сотрудника недостаточно для большого архива</h2>
          </div>
          <div className={styles.comparison}>
            <article><span>Штатный сотрудник</span><strong>≈ 5 000</strong><p>листов в месяц</p></article>
            <article><span>Команда Архивум</span><strong>до 30 000</strong><p>листов в месяц по комплексному тарифу</p></article>
          </div>
        </div>
      </section>

      <section className={styles.workflow}>
        <div className="shell">
          <p className={styles.kicker}>Как проходит проект</p>
          <h2>Принимаем по описи и фиксируем каждый этап</h2>
          <div className={styles.stepGrid}>
            {steps.map((step, index) => (
              <article key={step}><span>0{index + 1}</span><h3>{step}</h3></article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.pricePreview}>
        <div className="shell">
          <div className={styles.priceHeading}>
            <p className={styles.kicker}>Стоимость</p>
            <h2>Два способа расчёта</h2>
            <p>Состав работ выбирается под архив — без оплаты ненужных операций.</p>
          </div>
          <div className={styles.priceGrid}>
            <article><span>За лист</span><strong>от 15 ₽</strong><p>Оцифровка подготовленного массива и дополнительные операции по выбранному тарифу.</p></article>
            <article><span>За коробку</span><strong>от 50 000 ₽</strong><p>Осмотр, сортировка, отбор, оцифровка сохраняемых документов и формирование базы.</p></article>
          </div>
          <Link className="button" href="/prices#archive-processing">Сравнить тарифы</Link>
        </div>
      </section>

      <section className={styles.proof}>
        <div className="shell">
          <article><strong>≈ 1 млн</strong><span>страниц в выполненных проектах</span></article>
          <article><strong>до 5 000</strong><span>карточек документов в месяц</span></article>
          <article><strong>по описи</strong><span>приём и возврат оригиналов</span></article>
          <article><strong>по России</strong><span>работа на территории заказчика</span></article>
        </div>
      </section>

      <ContactBand
        title="Покажите архив — подготовим расчёт"
        text="Достаточно примерного количества коробок или листов, города и нескольких характерных образцов."
      />
    </PageShell>
  );
}
