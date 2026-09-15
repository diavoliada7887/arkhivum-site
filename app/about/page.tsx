import { ContactBand, PageShell } from "../components";

export default function AboutPage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow">О компании</p>
            <h1>Понимаем и сохранность оригинала, и логику цифрового фонда</h1>
          </div>
          <p>
            «Архивум» объединяет специалистов по оцифровке, архивной обработке,
            метаданным и разработке. Поэтому результат не распадается на
            несвязанные сканы, таблицы и программы.
          </p>
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
            <strong>8</strong>
            <span>направлений работы с фондами</span>
          </div>
          <div>
            <strong>50+ ТБ</strong>
            <span>собственной инфраструктуры хранения</span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell about-grid">
          <div>
            <p className="eyebrow">Наш подход</p>
            <h2>Проектируем от будущего использования</h2>
          </div>
          <div className="about-copy">
            <p>
              До начала производства выясняем, кто и как будет искать документы,
              какие форматы нужны для хранения и публикации, с какой системой
              предстоит обмениваться данными.
            </p>
            <p>
              Работаем на территории заказчика, когда фонд нельзя вывозить.
              Используем бесконтактную съёмку для сложных переплётов и крупного
              формата. Передаём результат поэтапно, чтобы качество было
              проверяемым на всём протяжении проекта.
            </p>
            <p>
              Наш диапазон — от единичного издания XVIII века до потоковой
              обработки в 1 000 страниц в час и наполнения внешних систем
              тысячами карточек документов ежемесячно.
            </p>
          </div>
        </div>
      </section>
      <section className="section section-paper">
        <div className="shell values-grid">
          <article>
            <span>01</span>
            <h3>Бережно</h3>
            <p>Режим работы определяется состоянием оригинала, а не скоростью оборудования.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Проверяемо</h3>
            <p>Каждый массив проходит контроль комплектности, изображения и структуры данных.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Практично</h3>
            <p>Файлы и метаданные должны работать в реальном процессе заказчика.</p>
          </article>
        </div>
      </section>
      <ContactBand />
    </PageShell>
  );
}
